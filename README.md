# Introduction

Copyright © Bentley Systems, Incorporated. All rights reserved. See 
[LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

This is a simple command line app that illustrates the workflow of configuring a report
using the Reporting & Insights platform APIs.

## Table of contents

- [Pre-reqs](#pre-reqs)
  - [Resources](#resources)
  - [Permissions](#permissions)
  - [Client registration](#client-registration)
- [Getting started](#getting-started)
  - [Project Structure](#project-structure)

## Pre-reqs

To build and run this app locally you will need a few things:

- Install [Git](https://git-scm.com/).
- Install [Node.js](https://nodejs.org/en/) v12 (must be greater than 12.10.x).
- Install [VS Code](https://code.visualstudio.com/).

### Resources

To successfully run this tool you will need to have an accessible iModel. If you don't
have one already, contact one of your Organization Administrators for access to an
iModel or take some time to go through the following tutorials:

- Create a [Project](https://developer.bentley.com/tutorials/create-and-query-projects-guide).
- Crate an [empty iModel](https://developer.bentley.com/tutorials/create-empty-imodel/).
- [Populate](https://developer.bentley.com/tutorials/synchronization-tutorial/) the iModel.

### Permissions

Use of the Insights and Reporting APIs requires some iModel/Project level Permissions.
For these Permissions, you must be an Organization Administrator for the Organization
that owns a given Project or have `administration_manage_roles` Permission assigned at
the Project level. If you do not have admin access to the Project or iModel you would
like to use, contact somebody who is a Project Administrator. As a Project Administrator,
you can use APIs described in the [Manage Project Team Members](https://developer.bentley.com/tutorials/manage-project-team-members-guide/)
tutorial to create a Role and update it with `"permissions": ["REPORTINGVIEW", "REPORTINGEDIT", "imodels_read", "imodels_write"]`.
Once this is done and the Role is assigned to you, you can use any iModel inside your
configured Project to finish this tutorial.

### Client registration

You need to register an Application to be able to access your data using this sample.
If you don't have one already, follow these steps to create an application.

1.  Go to https://developer.bentley.com.
2.  Click the Sign In button and sign-in using your Bentley account credentials.
    If you have not already registered, click Register now and complete the registration process.
3.  Click on your user icon at the top right and navigate to the 'My Apps' page.
4.  Click the 'Register New' button.
5.  Give your application a Name.
6.  Select the Reporting & Insights API association.
7.  Select application type Desktop/Mobile.
8.  Enter Redirect URL.
    For this tutorial use http://localhost:3000/signin-callback.
9.  Leave post logout redirect URIs empty.
10. Click the Save button.

You will receive a client id for the app. Put it in the [config file](src/config.json)
with issuerUrl, redirectUrl and scope (make sure you selected `insights:read` and
`insights:modify` scopes while creating the app).

## Getting started

- Clone the repository

  ```sh
  git clone https://github.com/iTwin/insights-api-sample-console-app.git
  ```

- Install dependencies

  ```sh
  cd insights-api-sample-console-app
  npm install
  ```

- Build and run the project

  ```sh
  npm run build
  npm run start
  ```

### Project Structure

The full folder structure of this app is explained below:

> **Note!** Make sure you have already built the app using `npm run build`

| Name                     | Description                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------|
| **.vscode**              | Contains VS Code specific settings                                                           |
| **.github**              | Contains Github related files                                                                |
| **lib**                  | Contains the distributable (or output) from your TypeScript build. This is the code you ship |
| **src**                  | Contains source code that will be compiled to the dist dir                                   |
| **src/Main.ts**          | Main entry point for executing API requests to create report based on iModel data            |
| package.json             | File that contains npm dependencies as well as build scripts                                 |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                              |
| config.json              | Config settings for authentication and iModel data extraction related configurations         |
