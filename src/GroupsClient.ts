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

export class GroupsClient extends ClientBase<Group, GroupCreateParams, GroupUpdateParams> {
  constructor(private iModelId: string, private mappingId: string) {
    super();
  }

  protected parseSingleEntityBody(body: any): Group {
    return body.group;
  }

  public getUrl(): string {
    return `${this.getUrlBase()}/datasources/iModels/${this.iModelId}/mappings/${this.mappingId}/groups`;
  }

  public async getGroups(requestContext: AuthorizedClientRequestContext): Promise<Group[]> {
    return this.getAll(requestContext, () => `${this.getUrl()}?`, "groups");
  }

  public async getGroup(requestContext: AuthorizedClientRequestContext, groupId: string): Promise<Group> {
    return this.getSingle(requestContext, () => `${this.getUrl()}/${groupId}`);
  }

  public async createGroup(requestContext: AuthorizedClientRequestContext, body: GroupCreateParams): Promise<Group> {
    return this.create(requestContext, () => this.getUrl(), body);
  }

  public async deleteGroup(requestContext: AuthorizedClientRequestContext, groupId: string): Promise<void> {
    return this.delete(requestContext, () => `${this.getUrl()}/${groupId}`);
  }

  public async updateGroup(requestContext: AuthorizedClientRequestContext, groupId: string, body: GroupUpdateParams): Promise<Group> {
    return this.patch(requestContext, () => `${this.getUrl()}/${groupId}`, body);
  }
}
