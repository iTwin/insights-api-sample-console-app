/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert, BentleyError, BentleyStatus } from "@bentley/bentleyjs-core";
import { ElectronAuthorizationBackend } from "@bentley/electron-manager/lib/ElectronBackend";
import { IModelHost } from "@bentley/imodeljs-backend";
import { NativeAppAuthorizationConfiguration } from "@bentley/imodeljs-common";
import { AccessToken } from "@bentley/itwin-client";
import { CalculatedProperty, CalculatedPropertyCreate, CustomCalculation, CustomCalculationCreate, ExtractionClient, ExtractionStatus, ExtractorState, Group, GroupProperty, GroupPropertyCreate, IExtractionClient, IMappingsClient, IReportsClient, Mapping, MappingsClient, Report, ReportMapping, ReportsClient } from "@itwin/insights-client";

const config = require('./config.json');
const BASE_URL = "https://api.bentley.com/insights/reporting";

async function signIn(issuerUrl: string, clientId: string, redirectUri: string, scope: string): Promise<AccessToken> {
  const authConfig: NativeAppAuthorizationConfiguration = {
    issuerUrl: issuerUrl,
    clientId: clientId,
    redirectUri: redirectUri,
    scope: scope,
  };

  const client = new ElectronAuthorizationBackend();
  await client.initialize(authConfig);

  return await client.signInComplete();
}

async function getOrCreateReport(client: IReportsClient, accessToken: string, projectId: string, reportName: string): Promise<Report> {
  const reports = await client.getReports(accessToken, projectId);
  const report = reports.find((r) => r.displayName === reportName && !r.deleted);
  if (report)
    return report;
  return client.createReport(accessToken, { displayName: reportName, projectId });
}

async function getOrCreateMapping(client: IMappingsClient, accessToken: string, iModelId: string, mappingName: string): Promise<Mapping> {
  const mappings = await client.getMappings(accessToken, iModelId);
  const mapping = mappings.find((m) => m.mappingName === mappingName);
  if (mapping)
    return mapping;
  return client.createMapping(accessToken, iModelId, { mappingName });
}

async function getOrCreateReportMapping(client: IReportsClient, accessToken: string, reportId: string, imodelId: string, mappingId: string): Promise<ReportMapping> {
  const reportMappings = await client.getReportMappings(accessToken, reportId);
  const reportMapping = reportMappings.find((r) => r.mappingId === mappingId);
  if (reportMapping)
    return reportMapping;
  return client.createReportMapping(accessToken, reportId, { mappingId, imodelId });
}

async function getOrCreateGroup(client: IMappingsClient, accessToken: string, iModelId: string, mappingId: string, groupCreateQuery: string, groupName: string): Promise<Group> {
  const groups = await client.getGroups(accessToken, iModelId, mappingId);
  const group = groups.find((g) => g.groupName === groupName);
  if (group)
    return group;
  return client.createGroup(accessToken, iModelId, mappingId, { groupName, query: groupCreateQuery });
}

async function getOrCreateGroupProperty(client: IMappingsClient, accessToken: string, iModelId: string, mappingId: string, groupId: string, groupPropertyParams: GroupPropertyCreate): Promise<GroupProperty> {
  const groupProperties = await client.getGroupProperties(accessToken, iModelId, mappingId, groupId);
  const groupProperty = groupProperties.find((g) => g.propertyName === groupPropertyParams.propertyName);
  if (groupProperty)
    return groupProperty;
  return client.createGroupProperty(
    accessToken,
    iModelId,
    mappingId,
    groupId,
    groupPropertyParams
  );
}

async function getOrCreateCalculatedProperty(client: IMappingsClient, accessToken: string, iModelId: string, mappingId: string, groupId: string, calcPropertyParams: CalculatedPropertyCreate): Promise<CalculatedProperty> {
  const calcProperties = await client.getCalculatedProperties(accessToken, iModelId, mappingId, groupId);
  const calcProperty = calcProperties.find((g) => g.propertyName === calcPropertyParams.propertyName);
  if (calcProperty)
    return calcProperty;
  return client.createCalculatedProperty(
    accessToken,
    iModelId,
    mappingId,
    groupId,
    calcPropertyParams
  );
}

async function getOrCreateCustomCalculation(client: IMappingsClient, accessToken: string, iModelId: string, mappingId: string, groupId: string, formulaCreateParams: CustomCalculationCreate): Promise<CustomCalculation> {
  const formulas = await client.getCustomCalculations(accessToken, iModelId, mappingId, groupId);
  const formula = formulas.find((g) => g.propertyName === formulaCreateParams.propertyName);
  if (formula)
    return formula;
  return client.createCustomCalculation(
    accessToken,
    iModelId,
    mappingId,
    groupId,
    formulaCreateParams
  );
}

async function waitForExtractionToFinish(client: IExtractionClient, accessToken: string, jobId: string, timeoutMS: number): Promise<ExtractionStatus> {
  let extractionStatus: ExtractionStatus = {
    state: ExtractorState.Queued,
    reason: "",
    containsIssues: false,
    _links: {
      logs: {
        href: "",
      },
    },
  };
  const startTime = new Date().getTime();

  // Wait for extraction to finish
  try {
    while (extractionStatus.state === ExtractorState.Queued || extractionStatus.state === ExtractorState.Running) {

      if (new Date().getTime() - startTime > timeoutMS) {
        throw new BentleyError(BentleyStatus.ERROR, "Extraction run is timeout.");
      }

      extractionStatus = await client.getExtractionStatus(accessToken, jobId);
      console.log(`Retrieve extraction status: ${extractionStatus.state} - ${extractionStatus.reason} after ${new Date().getTime() - startTime} ms.`);

      await new Promise((f) => setTimeout(f, 10000));
    }
  } catch (err) {
    console.error(err);
  }
  return extractionStatus;
}

export async function main(): Promise<void> {
  try {
    await IModelHost.startup();
    const authParams = config.authorization;
    const accessToken: AccessToken = await signIn(authParams.issuerUrl, authParams.clientId, authParams.redirectUri, authParams.scope);
    const token = accessToken.toTokenString();

    const reportsClient = new ReportsClient(BASE_URL);
    const mappingsClient = new MappingsClient(BASE_URL);
    const extractionClient = new ExtractionClient(BASE_URL);

    /**
    Sample steps:
    1. Create a report
    2. Create a mapping
    3. Create a group
    4. Create group properties of some common element attributes that pretty much any iModel would have (properties examples: Yaw, Pitch, Roll etc.)
    5. Create calculated properties like Length, Area etc.
    6. Create custom calculation formula properties using existing properties.
    7. Run extractor
    8. Ping the service to check the extractor status
    9. Export compiled OData to some local DB (sqlite?) or file system (combining all partitions into a single json) using AccessToken
   */
    const report = await getOrCreateReport(reportsClient, token, config.projectId, config.reportName);
    console.log(`Get or Created report: ${report.displayName} - ${report.id}`);

    const mapping = await getOrCreateMapping(mappingsClient, token, config.iModelId, config.mappingName);
    console.log(`Get or Created mapping: ${mapping.mappingName} - ${mapping.id}`);

    const reportMapping = await getOrCreateReportMapping(reportsClient, token, report.id, config.iModelId, mapping.id);
    console.log(`Get or Created report mapping: report: ${reportMapping.reportId} & mapping: ${reportMapping.mappingId}`);

    assert(reportMapping.mappingId === mapping.id);
    assert(reportMapping.reportId === report.id);

    const group = await getOrCreateGroup(mappingsClient, token, config.iModelId, mapping.id, config.groupCreateQuery, config.groupName);
    console.log(`Get or Created group: ${group.groupName} - ${group.id}`);

    assert(group.groupName === config.groupName);

    const groupProperty = await getOrCreateGroupProperty(mappingsClient, token, config.iModelId, mapping.id, group.id, config.groupProperty);
    console.log(`Get or Created group property: ${groupProperty.propertyName} - ${groupProperty.id}`);

    assert(groupProperty.propertyName === config.groupProperty.propertyName);

    const calcProperty = await getOrCreateCalculatedProperty(mappingsClient, token, config.iModelId, mapping.id, group.id, config.calculatedProperty);
    console.log(`Get or Created calculated property: ${calcProperty.propertyName} - ${calcProperty.id}`);

    assert(calcProperty.propertyName === config.calculatedProperty.propertyName);

    const formula = await getOrCreateCustomCalculation(mappingsClient, token, config.iModelId, mapping.id, group.id, config.customCalculation);
    console.log(`Get or Created formula: ${formula.propertyName} - ${formula.id}`);

    assert(formula.propertyName === config.customCalculation.propertyName);

    const extractionRun = await extractionClient.runExtraction(token, config.iModelId);
    console.log(`Run extraction: ${extractionRun.id}`);

    assert(extractionRun.id !== undefined);

    const extractionStatus = await waitForExtractionToFinish(extractionClient, token, extractionRun.id, config.timeoutMS);
    assert(extractionStatus !== undefined && extractionStatus.state !== undefined);

    if (extractionStatus.state === ExtractorState.Running) {
      console.log(`Extraction run out of time. Given timeout: ${config.timeoutMS}ms`);
    } else {
      console.log(`Extraction finished with status: ${extractionStatus.state} - ${extractionStatus.reason}`);
    }

    console.log("Done.");

  } catch (error) {
    console.error(error);
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
