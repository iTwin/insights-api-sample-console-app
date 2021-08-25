/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { ClientBase, Link } from "./ClientBase";

export interface ReportMapping {
  reportId: string;
  mappingId: string;
  _links: { report: Link };
}

export interface ReportMappingCreateParams {
  mappingId: string;
}

export namespace ReportMappingsClient {

  export function getUrl(reportId: string): string {
    return `${ClientBase.getUrlBase()}/reports/${reportId}/datasources/iModelMappings`;
  }

  export async function getReportMappings(requestContext: AuthorizedClientRequestContext, reportId: string): Promise<ReportMapping[]> {
    return ClientBase.getAll(requestContext, () => `${getUrl(reportId)}`, "mappings");
  }

  export async function  createReportMapping(requestContext: AuthorizedClientRequestContext, reportId: string, body: ReportMappingCreateParams): Promise<ReportMapping> {
    return ClientBase.post(requestContext, () => getUrl(reportId), body);
  }

  export async function  deleteReportMapping(requestContext: AuthorizedClientRequestContext, reportId: string, mappingId: string): Promise<void> {
    return ClientBase.del(requestContext, () => `${getUrl(reportId)}/${mappingId}`);
  }
}
