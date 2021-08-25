/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { ClientBase } from "./ClientBase";

export interface Group {
  id: string;
  mappingId: string;
  displayName: string;
  description: string;
  query: string;
}

export interface GroupCreateParams {
  displayName: string;
  query: string;
  description?: string;
}

export interface GroupUpdateParams {
  displayName?: string;
  query?: string;
  description?: string;
}

export namespace GroupsClient {

  export function getUrl(iModelId: string, mappingId: string): string {
    return `${ClientBase.getUrlBase()}/datasources/iModels/${iModelId}/mappings/${mappingId}/groups`;
  }

  export async function getGroups(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string): Promise<Group[]> {
    return ClientBase.getAll(requestContext, () => `${getUrl(iModelId, mappingId)}?`, "groups");
  }

  export async function getGroup(requestContext: AuthorizedClientRequestContext, groupId: string, iModelId: string, mappingId: string): Promise<Group> {
    return ClientBase.getSingle(requestContext, () => `${getUrl(iModelId, mappingId)}/${groupId}`);
  }

  export async function createGroup(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, body: GroupCreateParams): Promise<Group> {
    return ClientBase.post(requestContext, () => getUrl(iModelId, mappingId), body);
  }

  export async function deleteGroup(requestContext: AuthorizedClientRequestContext, groupId: string, iModelId: string, mappingId: string): Promise<void> {
    return ClientBase.del(requestContext, () => `${getUrl(iModelId, mappingId)}/${groupId}`);
  }

  export async function updateGroup(requestContext: AuthorizedClientRequestContext, groupId: string, iModelId: string, mappingId: string, body: GroupUpdateParams): Promise<Group> {
    return ClientBase.patch(requestContext, () => `${getUrl(iModelId, mappingId)}/${groupId}`, body);
  }
}
