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
import { GroupProperty, GroupPropertiesClient } from "./GroupPropertiesClient";
import { Mapping, MappingsClient } from "./MappingsClient";
import { Report, ReportsClient } from "./ReportsClient";
import { ExtractionClient, Run, Status } from './ExtractionClient';
import { ReportMapping, ReportMappingsClient } from "./ReportMappingsClient";

const config = require('./config.json');

const sampleProjectId = config.projectId;
const sampleIModelId = config.iModelId;
const sampleReportName = config.reportName;
const sampleMappingName = config.mappingName;
const sampleGroupName = config.groupName;
const sampleGroupProperty = config.groupProperty;

async function signIn(): Promise<AccessToken> {
  const authConfig: NativeAppAuthorizationConfiguration = {
    issuerUrl: config.authorization.issuerUrl,
    clientId: config.authorization.clientId,
    redirectUri: config.authorization.redirectUri,
    scope: config.authorization.scope,
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

async function getOrCreateReport(requestContext: AuthorizedClientRequestContext): Promise<Report> {
  const reportsClient = new ReportsClient();
  const reports = await reportsClient.getReports(requestContext, sampleProjectId);
  const report = reports.find((r) => r.displayName === sampleReportName && !r.deleted);
  if (report)
    return report;
  return reportsClient.createReport(requestContext, { displayName: sampleReportName, projectId: sampleProjectId });
}

async function getOrCreateMapping(requestContext: AuthorizedClientRequestContext): Promise<Mapping> {
  const mappingsClient = new MappingsClient(sampleIModelId);
  const mappings = await mappingsClient.getMappings(requestContext);
  const mapping = mappings.find((m) => m.displayName === sampleMappingName);
  if (mapping)
    return mapping;
  return mappingsClient.createMapping(requestContext, { displayName: sampleMappingName });
}

async function getOrCreateReportMapping(requestContext: AuthorizedClientRequestContext, reportId: string, mappingId: string): Promise<ReportMapping> {
  const reportMappingsClient = new ReportMappingsClient(reportId);
  const reportMappings = await reportMappingsClient.getReportMappings(requestContext);
  const reportMapping = reportMappings.find((r) => r.mappingId === mappingId);
  if (reportMapping)
    return reportMapping;
  return reportMappingsClient.createReportMapping(requestContext, { mappingId });
}

async function getOrCreateGroup(requestContext: AuthorizedClientRequestContext, mappingId: string): Promise<Group> {
  const groupsClient = new GroupsClient(sampleIModelId, mappingId);
  const groups = await groupsClient.getGroups(requestContext);
  const group = groups.find((g) => g.displayName === sampleGroupName);
  if (group)
    return group;
  return groupsClient.createGroup(requestContext, { displayName: sampleGroupName, query: config.groupCreateQuery });
}

async function getOrCreateGroupProperty(requestContext: AuthorizedClientRequestContext, mappingId: string, groupId: string): Promise<GroupProperty> {
  const groupPropertiesClient = new GroupPropertiesClient(sampleIModelId, mappingId, groupId);
  const groupProperties = await groupPropertiesClient.getGroupProperties(requestContext);
  const groupProperty = groupProperties.find((g) => g.displayName === sampleGroupProperty.displayName);
  if (groupProperty)
    return groupProperty;
  return groupPropertiesClient.createGroupProperty(
    requestContext,
    sampleGroupProperty
  );
}

async function runExtractor(requestContext: AuthorizedClientRequestContext): Promise<Run> {
  const extractionClient = new ExtractionClient(sampleIModelId);
  const extractionRun = await extractionClient.runExtraction(requestContext);
  return extractionRun;
}

async function pingExtractor(requestContext: AuthorizedClientRequestContext, jobId: string): Promise<Status> {
  const extractionClient = new ExtractionClient(sampleIModelId);
  const extractionStatus = await extractionClient.getExtractionStatus(requestContext, jobId);
  return extractionStatus;
}

async function waitForExtractionToFinish(requestContext: AuthorizedClientRequestContext, extractionId: string): Promise<Status> {
  let extractionStatus: Status = {
    state: "Running",
    reason: ""
  };
  let startTime = new Date().getTime()

  // Wait for extraction to finish
  try {
    while(extractionStatus.state == "Running" && new Date().getTime() - startTime < config.timeoutMS) {
      extractionStatus = await pingExtractor(requestContext, extractionId);
      console.log(`Retrieve extraction status: ${extractionStatus.state} - ${extractionStatus.reason} after ${new Date().getTime() - startTime} ms.`);

      await new Promise(f => setTimeout(f, 10000));
    }
  } catch (err)  {
    console.error(`${err.message}\n${err.stack}`);
  }
  return extractionStatus;
}

async function executeBasicWorkflow(requestContext: AuthorizedClientRequestContext): Promise<void> {
  /**
    Sample steps:
    1. Create a report
    2. Create a mapping
    3. Create a group
    4. Create group properties of some common element attributes that pretty much any iModel would have (element Volume, Surface Area or something like that)
    5. Run extractor
    6. Ping the service to check the extractor status
    7. Export compiled OData to some local DB (sqlite?) or file system (combining all partitions into a single json) using AccessToken
   */
  try {
    const report = await getOrCreateReport(requestContext);
    console.log(`Get or Created report: ${report.displayName} - ${report.id}`);

    const mapping = await getOrCreateMapping(requestContext);
    console.log(`Get or Created mapping: ${mapping.displayName} - ${mapping.id}`);

    const reportMapping = await getOrCreateReportMapping(requestContext, report.id, mapping.id);
    console.log(`Get or Created report mapping: report: ${reportMapping.reportId} & mapping: ${reportMapping.mappingId}`);

    assert ( reportMapping.mappingId == mapping.id );
    assert ( reportMapping.reportId == report.id );

    const group = await getOrCreateGroup(requestContext, mapping.id);
    console.log(`Get or Created group: ${group.displayName} - ${group.id}`);

    assert ( group.displayName == sampleGroupName )

    const groupProperty = await getOrCreateGroupProperty(requestContext, mapping.id, group.id);
    console.log(`Get or Created group property: ${groupProperty.displayName} - ${groupProperty.id}`);

    assert ( groupProperty.displayName == sampleGroupProperty.displayName );

    const extractionRun = await runExtractor(requestContext);
    console.log(`Run extraction: ${extractionRun.id}`);

    assert ( extractionRun.id != undefined)

    const extractionStatus = await waitForExtractionToFinish(requestContext, extractionRun.id);
    assert ( extractionStatus != undefined && extractionStatus.state != undefined )

    if(extractionStatus.state == "Running") {
      console.log(`Extraction run out of time. Given timeout: ${config.timeoutMS}ms`)
    } else {
      console.log(`Extraction finished with status: ${extractionStatus.state} - ${extractionStatus.reason}`);
    }

    console.log("Done.")

  } catch (error) {
    console.error(`${error.message}\n${error.stack}`);
  }
}

export async function main(): Promise<void> {
  try {
    await IModelHost.startup();
    const accessToken: AccessToken = await signIn();

    const requestContext = new AuthorizedClientRequestContext(accessToken);
    requestContext.enter();

    // Execute basic group and mapping workflow.
    // This will create a report, mapping, group, group properties and run extractor
    await executeBasicWorkflow(requestContext);

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
