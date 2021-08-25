/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { ClientBase, Link } from "./ClientBase";

export interface Report {
  id: string;
  displayName: string;
  description: string;
  deleted: boolean;
  _links: { project: Link };
}

export interface ReportCreateParams {
  displayName: string;
  projectId: string;
  description?: string;
}

export interface ReportUpdateParams {
  displayName?: string;
  description?: string;
  deleted?: boolean;
}
export namespace ReportsClient {

  export function getUrl(): string {
    return `${ClientBase.getUrlBase()}/reports`;
  }

  export async function getReports(requestContext: AuthorizedClientRequestContext, contextId: string): Promise<Report[]> {
    return ClientBase.getAll(requestContext, () => `${getUrl()}?projectId=${contextId}`, "reports");
  }

  export async function getReport(requestContext: AuthorizedClientRequestContext, reportId: string): Promise<Report> {
    return ClientBase.getSingle(requestContext, () => `${getUrl()}/${reportId}`);
  }

  export async function createReport(requestContext: AuthorizedClientRequestContext, body: ReportCreateParams): Promise<Report> {
    return ClientBase.post(requestContext, () => getUrl(), body);
  }

  export async function deleteReport(requestContext: AuthorizedClientRequestContext, reportId: string): Promise<void> {
    return ClientBase.del(requestContext, () => `${getUrl()}/${reportId}`);
  }

  export async function updateReport(requestContext: AuthorizedClientRequestContext, reportId: string, body: ReportUpdateParams): Promise<Report> {
    return ClientBase.patch(requestContext, () => `${getUrl()}/${reportId}`, body);
  }
}