/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext, request, RequestOptions, Response } from "@bentley/itwin-client";
import { BentleyError, RepositoryStatus } from '@bentley/bentleyjs-core';

export interface Link {
  href: string;
}
export interface Links {
  next: Link;
  self: Link;
}

export namespace ClientBase {

  export function parseSingleEntityBody(body: any): any {
      if('group' in body) {
        return body.group;
      } else if ('mapping' in body) {
        return body.mapping;
      } else if ('property' in body) {
        return body.property;
      } else if ('report' in body) {
        return body.report;
      } else if ('status' in body) {
        return body.status;
      } else if ('run' in body) {
        return body.run;
      } else {
        throw new BentleyError(RepositoryStatus.InvalidResponse, "Response body is invalid.");
      }
  }

  export function createRequestOptions(requestContext: AuthorizedClientRequestContext, method: string, body?: any): RequestOptions {
    return {
      method,
      headers: {
        Authorization: requestContext.accessToken.toTokenString(),
      },
      body,
    };
  }

  export function getUrlBase(): string {
    return 'https://api.bentley.com/insights';
  }

  export async function getAll(requestContext: AuthorizedClientRequestContext, urlFactory: () => string, resultName: string): Promise<any[]> {
    requestContext.enter();
    const results: any[] = [];

    const urlRoot = urlFactory();
    const options = createRequestOptions(requestContext, "GET");

    let url = urlRoot;
    do {
      const resp: Response = await request(requestContext, url, options);
      requestContext.enter();
      results.push(...resp.body[resultName]);
      url = resp.body._links.next?.href ?? null;
    } while (null !== url);

    return results;
  }

  export async function getSingle(requestContext: AuthorizedClientRequestContext, urlFactory: () => string): Promise<any> {
    requestContext.enter();
    const url = urlFactory();
    const options = createRequestOptions(requestContext, "GET");

    const resp: Response = await request(requestContext, url, options);
    requestContext.enter();
    return parseSingleEntityBody(resp.body);
  }

  export async function post(requestContext: AuthorizedClientRequestContext, urlFactory: () => string, body: any): Promise<any> {
    requestContext.enter();
    const url = urlFactory();
    const options = createRequestOptions(requestContext, "POST", body);

    const resp: Response = await request(requestContext, url, options);
    requestContext.enter();
    return parseSingleEntityBody(resp.body);
  }

  export async function patch(requestContext: AuthorizedClientRequestContext, urlFactory: () => string, body: any): Promise<any> {
    requestContext.enter();
    const url = urlFactory();
    const options = createRequestOptions(requestContext, "PATCH", body);

    const resp: Response = await request(requestContext, url, options);
    requestContext.enter();
    return parseSingleEntityBody(resp.body);
  }

  export async function del(requestContext: AuthorizedClientRequestContext, urlFactory: () => string): Promise<void> {
    requestContext.enter();
    const url = urlFactory();
    const options = createRequestOptions(requestContext, "DELETE");

    await request(requestContext, url, options);
    requestContext.enter();
  }

  export async function put(requestContext: AuthorizedClientRequestContext, urlFactory: () => string, body: any): Promise<any> {
    requestContext.enter();
    const url = urlFactory();
    const options = createRequestOptions(requestContext, "PUT", body);

    const resp: Response = await request(requestContext, url, options);
    requestContext.enter();
    return parseSingleEntityBody(resp.body);
  }
}