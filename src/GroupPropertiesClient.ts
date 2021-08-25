/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { ClientBase, Links } from "./ClientBase";

export interface ECProperty {
  ecSchemaName: string;
  ecClassName: string;
  ecPropertyName: string;
  ecPropertyType: string;
}

export interface GroupProperty {
  id: string;
  displayName: string;
  dataType: string;
  quantityType: string;
  ecProperties: ECProperty;
  _links: { report: Links };
}

export interface GroupPropertyCreateParams {
  displayName: string;
  dataType: string;
  quantityType: string;
  ecProperties: ECProperty[];
}

export interface GroupPropertyUpdateParams {
  displayName: string;
  dataType: string;
  quantityType: string;
  ecProperties: ECProperty[];
}

export namespace GroupPropertiesClient {
  export function getUrl(iModelId: string, mappingId: string, groupId: string): string {
    return `${ClientBase.getUrlBase()}/datasources/iModels/${iModelId}/mappings/${mappingId}/groups/${groupId}/properties`;
  }

  export async function getGroupProperties(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, groupId: string): Promise<GroupProperty[]> {
    return ClientBase.getAll(requestContext, () => `${getUrl(iModelId, mappingId, groupId)}?`, "properties");
  }

  export async function getGroupProperty(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, groupId: string, groupPropertyId: string): Promise<GroupProperty> {
    return ClientBase.getSingle(requestContext, () => `${getUrl(iModelId, mappingId, groupId)}/${groupPropertyId}`);
  }

  export async function createGroupProperty(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, groupId: string, body: GroupPropertyCreateParams): Promise<GroupProperty> {
    return ClientBase.post(requestContext, () => getUrl(iModelId, mappingId, groupId), body);
  }

  export async function deleteGroupProperty(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, groupId: string, groupPropertyId: string): Promise<void> {
    return ClientBase.del(requestContext, () => `${getUrl(iModelId, mappingId, groupId)}/${groupPropertyId}`);
  }

  export async function updateGroupProperty(requestContext: AuthorizedClientRequestContext, iModelId: string, mappingId: string, groupId: string, groupPropertyId: string, body: GroupPropertyUpdateParams): Promise<GroupProperty> {
    return ClientBase.put(requestContext, () => `${getUrl(iModelId, mappingId, groupId)}/${groupPropertyId}`, body);
  }
}
