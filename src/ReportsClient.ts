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

export class ReportsClient extends ClientBase<Report, ReportCreateParams, ReportUpdateParams> {
  constructor() {
    super();
  }

  protected parseSingleEntityBody(body: any): Report {
    return body.report;
  }

  public getUrl(): string {
    return `${this.getUrlBase()}/reports`;
  }

  public async getReports(requestContext: AuthorizedClientRequestContext, contextId: string): Promise<Report[]> {
    return this.getAll(requestContext, () => `${this.getUrl()}?projectId=${contextId}`, "reports");
  }

  public async getReport(requestContext: AuthorizedClientRequestContext, reportId: string): Promise<Report> {
    return this.getSingle(requestContext, () => `${this.getUrl()}/${reportId}`);
  }

  public async createReport(requestContext: AuthorizedClientRequestContext, body: ReportCreateParams): Promise<Report> {
    return this.post(requestContext, () => this.getUrl(), body);
  }

  public async deleteReport(requestContext: AuthorizedClientRequestContext, reportId: string): Promise<void> {
    return this.delete(requestContext, () => `${this.getUrl()}/${reportId}`);
  }

  public async updateReport(requestContext: AuthorizedClientRequestContext, reportId: string, body: ReportUpdateParams): Promise<Report> {
    return this.patch(requestContext, () => `${this.getUrl()}/${reportId}`, body);
  }
}
