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

export namespace MappingsClient {

  export function getUrl(iModelId: string): string {
    return `${ClientBase.getUrlBase()}/datasources/iModels/${iModelId}/mappings`;
  }

  export async function getMappings(requestContext: AuthorizedClientRequestContext, iModelId: string): Promise<Mapping[]> {
    return ClientBase.getAll(requestContext, () => `${getUrl(iModelId)}?`, "mappings");
  }

  export async function getMapping(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string): Promise<Mapping> {
    return ClientBase.getSingle(requestContext, () => `${getUrl(iModelId)}/${mappingId}`);
  }

  export async function createMapping(requestContext: AuthorizedClientRequestContext, iModelId: string, body: MappingCreateParams): Promise<Mapping> {
    return ClientBase.post(requestContext, () => getUrl(iModelId), body);
  }

  export async function deleteMapping(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string): Promise<void> {
    return ClientBase.del(requestContext, () => `${getUrl(iModelId)}/${mappingId}`);
  }

  export async function updateMapping(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, body: MappingUpdateParams): Promise<Mapping> {
    return ClientBase.patch(requestContext, () => `${getUrl(iModelId)}/${mappingId}`, body);
  }
}
