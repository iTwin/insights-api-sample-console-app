# insights-api-sample-console-app

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

To successfully run this tool you will need to have an accessible iModel. If you don't have one already [this](https://www.itwinjs.org/learning/tutorials/create-test-imodel-sample/) guide will help you to create it.

### Client registration

You need a clientId to bypass authorization. If you don't have one already [this](https://developer.bentley.com/apis/overview/registration/) guide will help you create it.

You will receive a client id for the app. Put it in the configs.json file with issuerUrl, redirectUrl and scope (make sure you selected insights:read and insights:modify scopes while creating the app).

## Getting started

- Clone the repository

  ```sh
  git clone <github link>
  ```

- Install dependencies

  ```sh
  cd <project_name>
  npm install
  ```

- Build and run the project

  ```sh
  npm run build
  npm run start
  ```

### Project Structure

TODO: update

The full folder structure of this app is explained below:

> **Note!** Make sure you have already built the app using `npm run build`

| Name                     | Description |
| ------------------------ | ---------------------------------------------------------------------------------------------|
| **.vscode**              | Contains VS Code specific settings                                                           |
| **.github**              | Contains Github related files                                                                |
| **lib**                  | Contains the distributable (or output) from your TypeScript build. This is the code you ship |
| **src**                  | Contains source code that will be compiled to the dist dir                                   |
| **src/Main.ts**          | Main entry point for executing queries against remote iModel                                 |
| package.json             | File that contains npm dependencies as well as build scripts                                 |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                              |
| config.json              | Config settings for authentication and API samples                                           |