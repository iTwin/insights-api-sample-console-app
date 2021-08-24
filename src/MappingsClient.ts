/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { ClientBase, Link } from "./ClientBase";

export interface Mapping {
  id: string;
  displayName: string;
  description: string;
  _links: { imodel: Link };
}

export interface MappingCreateParams {
  displayName: string;
  description?: string;
}

export interface MappingUpdateParams {
  displayName?: string;
  description?: string;
}

export class MappingsClient extends ClientBase<Mapping, MappingCreateParams, MappingUpdateParams> {
  constructor(private iModelId: string) {
    super();
  }

  protected parseSingleEntityBody(body: any): Mapping {
    return body.mapping;
  }

  public getUrl(): string {
    return `${this.getUrlBase()}/datasources/iModels/${this.iModelId}/mappings`;
  }

  public async getMappings(requestContext: AuthorizedClientRequestContext): Promise<Mapping[]> {
    return this.getAll(requestContext, () => `${this.getUrl()}?`, "mappings");
  }

  public async getMapping(requestContext: AuthorizedClientRequestContext, mappingId: string): Promise<Mapping> {
    return this.getSingle(requestContext, () => `${this.getUrl()}/${mappingId}`);
  }

  public async createMapping(requestContext: AuthorizedClientRequestContext, body: MappingCreateParams): Promise<Mapping> {
    return this.post(requestContext, () => this.getUrl(), body);
  }

  public async deleteMapping(requestContext: AuthorizedClientRequestContext, mappingId: string): Promise<void> {
    return this.delete(requestContext, () => `${this.getUrl()}/${mappingId}`);
  }

  public async updateMapping(requestContext: AuthorizedClientRequestContext, mappingId: string, body: MappingUpdateParams): Promise<Mapping> {
    return this.patch(requestContext, () => `${this.getUrl()}/${mappingId}`, body);
  }
}
