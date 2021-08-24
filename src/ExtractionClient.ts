/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext, request, Response } from "@bentley/itwin-client";
import { ClientBase } from "./ClientBase";

export interface Run {
  id: string;
}

export interface Status {
  state: ExtractionRunState;
  reason: string;
}

export enum ExtractionRunState {
  Pending = 1, // TODO: this state is not added in API docs
  Running = 2,
  Failed = 3,
  Succeeded = 4
}

export class ExtractionClient extends ClientBase<Status, Run, undefined> {
  constructor(private iModelId: string) {
    super();
  }

  protected parseSingleEntityBody(body: any): Status {
    return body.status;
  }

  protected parseExtractionRunResult(body: any): Run {
    return body.run;
  }

  public getUrl(): string {
    return `${this.getUrlBase()}/datasources/iModels/${this.iModelId}/extraction`;
  }

  public async getExtractionStatus(requestContext: AuthorizedClientRequestContext, jobId: string): Promise<Status> {
    return this.getSingle(requestContext, () => `${this.getUrl()}/status/${jobId}`);
  }

  public async runExtraction(requestContext: AuthorizedClientRequestContext): Promise<Run> {
    requestContext.enter();
    let options = {
      method: "POST",
      headers: {
        Authorization: requestContext.accessToken.toTokenString(),
      }
    };
    const resp: Response = await request(requestContext, `${this.getUrl()}/run`, options);
    requestContext.enter();
    return this.parseExtractionRunResult(resp.body);
  }
}
