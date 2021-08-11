/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { ClientBase, Links } from "./ClientBase";

export interface Ecproperty {
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
  ecProperties: Ecproperty;
  _links: { report: Links };
}

export interface GroupPropertyCreateParams {
  displayName: string;
  dataType: string;
  quantityType: string;
  ecProperties: Ecproperty[];
}

export interface GroupPropertyUpdateParams {
  displayName: string;
  dataType: string;
  quantityType: string;
  ecProperties: Ecproperty[];
}

export class GroupPropertiesClient extends ClientBase<GroupProperty, GroupPropertyCreateParams, GroupPropertyUpdateParams> {
  constructor(private iModelId: string, private mappingId: string, private groupId: string) {
    super();
  }

  protected parseSingleEntityBody(body: any): GroupProperty {
    return body.property;
  }

  public getUrl(): string {
    return `${this.getUrlBase()}/datasources/iModels/${this.iModelId}/mappings/${this.mappingId}/groups/${this.groupId}/properties`;
  }

  public async getGroupProperties(requestContext: AuthorizedClientRequestContext): Promise<GroupProperty[]> {
    return this.getAll(requestContext, () => `${this.getUrl()}?`, "properties");
  }

  public async getGroupProperty(requestContext: AuthorizedClientRequestContext, groupPropertyId: string): Promise<GroupProperty> {
    return this.getSingle(requestContext, () => `${this.getUrl()}/${groupPropertyId}`);
  }

  public async createGroupProperty(requestContext: AuthorizedClientRequestContext, body: GroupPropertyCreateParams): Promise<GroupProperty> {
    return this.create(requestContext, () => this.getUrl(), body);
  }

  public async deleteGroupProperty(requestContext: AuthorizedClientRequestContext, groupPropertyId: string): Promise<void> {
    return this.delete(requestContext, () => `${this.getUrl()}/${groupPropertyId}`);
  }

  public async updateGroupProperty(requestContext: AuthorizedClientRequestContext, groupPropertyId: string, body: GroupPropertyUpdateParams): Promise<GroupProperty> {
    return this.put(requestContext, () => `${this.getUrl()}/${groupPropertyId}`, body);
  }
}
