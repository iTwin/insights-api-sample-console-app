# Introduction

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

The Report configurator is a simple command line app that illustrates the workflow of configuring a report on the Reporting & Insights platform.

## Table of contents

- [Pre-reqs](#pre-reqs)
  - [Creating a test iModel](#creating-test-imodel)
  - [Client registration](#client-registration)
- [Getting started](#getting-started)
  - [Project Structure](#project-structure)

## Pre-reqs

To build and run this app locally you will need a few things:

- Install [Git](https://git-scm.com/)
- Install [Node.js](https://nodejs.org/en/) v12 (must be greater than 12.10.x)
- Install [VS Code](https://code.visualstudio.com/)

### Creating a test iModel

To successfully run this tool you will need to have an accessible iModel. If you don't have one already, [this guide](https://www.itwinjs.org/learning/tutorials/create-test-imodel-sample/)  will help you to create it.

> **Note!** Make sure you have Insights and Reporting roles permission from the project. If you do not have, contact anyone who is project administrator to assign you the role.

### Client registration

You need to register an Application to be able to access your data using this sample. If you don't have one already, follow next steps to create an application.

1.  Go to https://developer.bentley.com
2.  Click the Sign In button and sign-in using your Bentley account credentials
    If you have not already registered, click Register now and complete the registration process.
3.  Click on your user icon and navigate to the My Apps page
4.  Click the Register New button
5.  Give your application a Name
6.  Select Visualization API association and deselect all other scopes except openid
7.  Select the Reporting & Insights API association
8.  Select application type SPA (Single Page Web Application)
9.  Enter Redirect URL
    For this tutorial use http://localhost:3000/signin-callback
10.  Leave post logout redirect URIs empty.
11. Click the Save button

You will receive a client id for the app. Put it in the [config file](src/config.json) with issuerUrl, redirectUrl and scope (make sure you selected insights:read and insights:modify scopes while creating the app).

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