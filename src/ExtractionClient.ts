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
  Pending = "Pending", // TODO: this state is not added in API docs
  Running = "Running",
  Failed = "Failed",
  Succeeded = "Succeeded"
}

export namespace ExtractionClient {

  export function getUrl(iModelId: string): string {
    return `${ClientBase.getUrlBase()}/datasources/iModels/${iModelId}/extraction`;
  }

  export async function getExtractionStatus(requestContext: AuthorizedClientRequestContext, jobId: string, iModelId: string): Promise<Status> {
    return ClientBase.getSingle(requestContext, () => `${getUrl(iModelId)}/status/${jobId}`);
  }

  export async function runExtraction(requestContext: AuthorizedClientRequestContext, iModelId: string): Promise<Run> {
    requestContext.enter();
    let options = {
      method: "POST",
      headers: {
        Authorization: requestContext.accessToken.toTokenString(),
      }
    };
    const resp: Response = await request(requestContext, `${getUrl(iModelId)}/run`, options);
    requestContext.enter();
    return resp.body.run;
  }
}

