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

export class ReportMappingsClient extends ClientBase<ReportMapping, ReportMappingCreateParams, undefined> {
  constructor(private reportId: string) {
    super();
  }

  protected parseSingleEntityBody(body: any): ReportMapping {
    return body.mapping;
  }

  public getUrl(): string {
    return `${this.getUrlBase()}/reports/${this.reportId}/datasources/iModelMappings`;
  }

  public async getReportMappings(requestContext: AuthorizedClientRequestContext): Promise<ReportMapping[]> {
    return this.getAll(requestContext, () => `${this.getUrl()}`, "mappings");
  }

  public async createReportMapping(requestContext: AuthorizedClientRequestContext, body: ReportMappingCreateParams): Promise<ReportMapping> {
    return this.create(requestContext, () => this.getUrl(), body);
  }

  public async deleteReportMapping(requestContext: AuthorizedClientRequestContext, mappingId: string): Promise<void> {
    return this.delete(requestContext, () => `${this.getUrl()}/${mappingId}`);
  }
}
