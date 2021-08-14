/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert, BentleyError, AuthStatus } from "@bentley/bentleyjs-core";
import { ElectronAuthorizationBackend } from "@bentley/electron-manager/lib/ElectronBackend";
import { IModelHost, NativeHost } from "@bentley/imodeljs-backend";
import { NativeAppAuthorizationConfiguration } from "@bentley/imodeljs-common";
import { AccessToken, AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { Group, GroupsClient } from "./GroupsClient";
import { GroupProperty, GroupPropertiesClient, GroupPropertyUpdateParams } from "./GroupPropertiesClient";
import { Mapping, MappingsClient } from "./MappingsClient";
import { Report, ReportsClient } from "./ReportsClient";
import { ExtractionClient, Run, Status, ExtractionRunState } from './ExtractionClient';
import { ReportMapping, ReportMappingsClient } from "./ReportMappingsClient";

const config = require('./config.json');

async function signIn(issuerUrl: string, clientId: string, redirectUri: string, scope: string): Promise<AccessToken> {
  const authConfig: NativeAppAuthorizationConfiguration = {
    issuerUrl: issuerUrl,
    clientId: clientId,
    redirectUri: redirectUri,
    scope: scope,
  };

  const client = new ElectronAuthorizationBackend();
  await client.initialize(authConfig);

  return new Promise<AccessToken>((resolve, reject) => {
    NativeHost.onUserStateChanged.addListener((token) => {
      if (token) {
        resolve(token);
      } else {
        reject(new BentleyError(AuthStatus.Error, "Failed to sign in"));
      }
    });
    client.signIn().catch((err) => reject(err));
  });
}

async function getOrCreateReport(requestContext: AuthorizedClientRequestContext, projectId: string, reportName: string): Promise<Report> {
  const reportsClient = new ReportsClient();
  const reports = await reportsClient.getReports(requestContext, projectId);
  const report = reports.find((r) => r.displayName === reportName && !r.deleted);
  if (report)
    return report;
  return reportsClient.createReport(requestContext, { displayName: reportName, projectId: projectId });
}

async function getOrCreateMapping(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingName: string): Promise<Mapping> {
  const mappingsClient = new MappingsClient(iModelId);
  const mappings = await mappingsClient.getMappings(requestContext);
  const mapping = mappings.find((m) => m.displayName === mappingName);
  if (mapping)
    return mapping;
  return mappingsClient.createMapping(requestContext, { displayName: mappingName });
}

async function getOrCreateReportMapping(requestContext: AuthorizedClientRequestContext, reportId: string, mappingId: string): Promise<ReportMapping> {
  const reportMappingsClient = new ReportMappingsClient(reportId);
  const reportMappings = await reportMappingsClient.getReportMappings(requestContext);
  const reportMapping = reportMappings.find((r) => r.mappingId === mappingId);
  if (reportMapping)
    return reportMapping;
  return reportMappingsClient.createReportMapping(requestContext, { mappingId });
}

async function getOrCreateGroup(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, groupCreateQuery: string, groupName: string): Promise<Group> {
  const groupsClient = new GroupsClient(iModelId, mappingId);
  const groups = await groupsClient.getGroups(requestContext);
  const group = groups.find((g) => g.displayName === groupName);
  if (group)
    return group;
  return groupsClient.createGroup(requestContext, { displayName: groupName, query: groupCreateQuery });
}

async function getOrCreateGroupProperty(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, groupId: string, groupPropertyParams: GroupPropertyUpdateParams): Promise<GroupProperty> {
  const groupPropertiesClient = new GroupPropertiesClient(iModelId, mappingId, groupId);
  const groupProperties = await groupPropertiesClient.getGroupProperties(requestContext);
  const groupProperty = groupProperties.find((g) => g.displayName === groupPropertyParams.displayName);
  if (groupProperty)
    return groupProperty;
  return groupPropertiesClient.createGroupProperty(
    requestContext,
    groupPropertyParams
  );
}

async function runExtractor(requestContext: AuthorizedClientRequestContext, iModelId: string): Promise<Run> {
  const extractionClient = new ExtractionClient(iModelId);
  const extractionRun = await extractionClient.runExtraction(requestContext);
  return extractionRun;
}

async function pingExtractor(requestContext: AuthorizedClientRequestContext, iModelId: string, jobId: string): Promise<Status> {
  const extractionClient = new ExtractionClient(iModelId);
  const extractionStatus = await extractionClient.getExtractionStatus(requestContext, jobId);
  return extractionStatus;
}

async function waitForExtractionToFinish(requestContext: AuthorizedClientRequestContext, extractionId: string, iModelId: string, timeoutMS: number): Promise<Status> {
  let extractionStatus: Status = {
    state: ExtractionRunState.Pending,
    reason: ""
  };
  let startTime = new Date().getTime()

  // Wait for extraction to finish
  try {
    while(extractionStatus.state != ExtractionRunState.Succeeded && extractionStatus.state != ExtractionRunState.Failed && new Date().getTime() - startTime < timeoutMS) {

      extractionStatus = await pingExtractor(requestContext, iModelId, extractionId);
      console.log(`Retrieve extraction status: ${extractionStatus.state} - ${extractionStatus.reason} after ${new Date().getTime() - startTime} ms.`);

      await new Promise(f => setTimeout(f, 10000));
    }
  } catch (err)  {
    console.error(`${err.message}\n${err.stack}`);
  }
  return extractionStatus;
}

export async function main(): Promise<void> {
  try {
    await IModelHost.startup();
    let authParams = config.authorization;
    const accessToken: AccessToken = await signIn(authParams.issuerUrl, authParams.clientId, authParams.redirectUri, authParams.scope);

    const requestContext = new AuthorizedClientRequestContext(accessToken);
    requestContext.enter();

    /**
    Sample steps:
    1. Create a report
    2. Create a mapping
    3. Create a group
    4. Create group properties of some common element attributes that pretty much any iModel would have (properties examples: Yaw, Pitch, Roll etc.)
    5. Run extractor
    6. Ping the service to check the extractor status
    7. Export compiled OData to some local DB (sqlite?) or file system (combining all partitions into a single json) using AccessToken
   */
    const report = await getOrCreateReport(requestContext, config.projectId, config.reportName);
    console.log(`Get or Created report: ${report.displayName} - ${report.id}`);

    const mapping = await getOrCreateMapping(requestContext, config.iModelId, config.mappingName);
    console.log(`Get or Created mapping: ${mapping.displayName} - ${mapping.id}`);

    const reportMapping = await getOrCreateReportMapping(requestContext, report.id, mapping.id);
    console.log(`Get or Created report mapping: report: ${reportMapping.reportId} & mapping: ${reportMapping.mappingId}`);

    assert ( reportMapping.mappingId == mapping.id );
    assert ( reportMapping.reportId == report.id );

    const group = await getOrCreateGroup(requestContext, config.iModelId, mapping.id, config.groupCreateQuery, config.groupName);
    console.log(`Get or Created group: ${group.displayName} - ${group.id}`);

    assert ( group.displayName == config.groupName )

    const groupProperty = await getOrCreateGroupProperty(requestContext, config.iModelId, mapping.id, group.id, config.groupProperty);
    console.log(`Get or Created group property: ${groupProperty.displayName} - ${groupProperty.id}`);

    assert ( groupProperty.displayName == config.groupProperty.displayName );

    const extractionRun = await runExtractor(requestContext, config.iModelId);
    console.log(`Run extraction: ${extractionRun.id}`);

    assert ( extractionRun.id != undefined)

    const extractionStatus = await waitForExtractionToFinish(requestContext, extractionRun.id, config.iModelId, config.timeoutMS);
    assert ( extractionStatus != undefined && extractionStatus.state != undefined )

    if(extractionStatus.state == ExtractionRunState.Running) {
      console.log(`Extraction run out of time. Given timeout: ${config.timeoutMS}ms`)
    } else {
      console.log(`Extraction finished with status: ${extractionStatus.state} - ${extractionStatus.reason}`);
    }

    console.log("Done.")

  } catch (error) {
    console.error(`${error.message}\n${error.stack}`);
  } finally {
    await IModelHost.shutdown();
  }
}

if (require.main === module) {
  (async () => {
    await main();
  })().catch((err) => {
    if (err instanceof BentleyError)
      process.stderr.write(`Error: ${err.name}: ${err.message}`);
    else
      process.stderr.write(`Unknown error: ${err.message}`);
    process.exit(err.errorNumber ?? -1);
  });
}
