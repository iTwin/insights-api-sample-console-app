/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext, request, RequestOptions, Response } from "@bentley/itwin-client";

export interface Link {
  href: string;
}
export interface Links {
  next: Link;
  self: Link;
}

export abstract class ClientBase<TEntity, TCreateParams, TUpdateParams> {
  protected abstract parseSingleEntityBody(body: any): TEntity;

  private createRequestOptions(requestContext: AuthorizedClientRequestContext, method: string, body?: any): RequestOptions {
    return {
      method,
      headers: {
        Authorization: requestContext.accessToken.toTokenString(),
      },
      body,
    };
  }

  protected getUrlBase(): string {
    return 'https://api.bentley.com/insights';
  }

  protected async getAll(requestContext: AuthorizedClientRequestContext, urlFactory: () => string, resultName: string): Promise<TEntity[]> {
    requestContext.enter();
    const results: TEntity[] = [];

    const urlRoot = urlFactory();
    const options = this.createRequestOptions(requestContext, "GET");

    let url = urlRoot;
    do {
      const resp: Response = await request(requestContext, url, options);
      requestContext.enter();
      results.push(...resp.body[resultName]);
      url = resp.body._links.next?.href ?? null;
    } while (null !== url);

    return results;
  }

  protected async getSingle(requestContext: AuthorizedClientRequestContext, urlFactory: () => string): Promise<TEntity> {
    requestContext.enter();
    const url = urlFactory();
    const options = this.createRequestOptions(requestContext, "GET");

    const resp: Response = await request(requestContext, url, options);
    requestContext.enter();
    return this.parseSingleEntityBody(resp.body);
  }

  protected async create(requestContext: AuthorizedClientRequestContext, urlFactory: () => string, body: TCreateParams): Promise<TEntity> {
    requestContext.enter();
    const url = urlFactory();
    const options = this.createRequestOptions(requestContext, "POST", body);

    const resp: Response = await request(requestContext, url, options);
    requestContext.enter();
    return this.parseSingleEntityBody(resp.body);
  }

  protected async patch(requestContext: AuthorizedClientRequestContext, urlFactory: () => string, body: TUpdateParams): Promise<TEntity> {
    requestContext.enter();
    const url = urlFactory();
    const options = this.createRequestOptions(requestContext, "PATCH", body);

    const resp: Response = await request(requestContext, url, options);
    requestContext.enter();
    return this.parseSingleEntityBody(resp.body);
  }

  protected async delete(requestContext: AuthorizedClientRequestContext, urlFactory: () => string): Promise<void> {
    requestContext.enter();
    const url = urlFactory();
    const options = this.createRequestOptions(requestContext, "DELETE");

    await request(requestContext, url, options);
    requestContext.enter();
  }

  protected async put(requestContext: AuthorizedClientRequestContext, urlFactory: () => string, body: TUpdateParams): Promise<TEntity> {
    requestContext.enter();
    const url = urlFactory();
    const options = this.createRequestOptions(requestContext, "PUT", body);

    const resp: Response = await request(requestContext, url, options);
    requestContext.enter();
    return this.parseSingleEntityBody(resp.body);
  }
}
