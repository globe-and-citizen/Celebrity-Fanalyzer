# Globe&Citizen Contributing Guide

Hi! I'm really excited that you are interested in contributing to Vue.js. Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

- [Code of Conduct](https://github.com/globe-and-citizen/Celebrity-Fanalyzer/.github/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Issue Reporting Guidelines

### Before You Start...

The issue list is reserved exclusively for bug reports and feature requests. That means we do not accept usage questions. If you open an issue that does not conform to the requirements,
**it will be closed immediately**.

[Why are we so strict about this?](#the-reason-behind-our-strict-issue-policy)

For usage questions, please use the following resources:

- Join our discord chanel

Also try to search for your issue - it may have already been answered or even fixed in the development branch. However, if you find that an old, closed issue still persists in the latest version, you should open a new issue instead of commenting on the old issue.

### The reason behind our strict issue policy

Maintaining open source projects, especially popular ones, is [hard work](https://nolanlawson.com/2017/03/05/what-it-feels-like-to-be-an-open-source-maintainer/).

As a free and open source project, we also has limited maintainer bandwidth. That means the only way to ensure the project's sustainability is to:

1. Prioritize more concrete work (bug fixes and new features);
2. Improve issue triaging efficiency. For (1), we have decided to use the GitHub issue lists exclusively for work that has well-defined, actionable goals. Questions and open ended discussions should be posted to discord that are better suited for them.

For (2), we have found that issues that do not provide proper information upfront usually results in terribly inefficient back-and-forth communication just to extract the basic information needed for actual triaging. This is exactly why we have created this app: to ensure that every issue is created with the necessary information, and to save time on both sides.

## Pull Request Guidelines

- The `main` branch is just a snapshot of the latest stable release. All development should be done in dedicated branches.
  **Do not submit PRs against the `main` branch.**

- Checkout a topic branch from the relevant branch, e.g. `develop`, and merge back against that branch.

- Work in the `src` folder and **DO NOT** checkin `dist` in the commits.

- It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.

- Make sure `npm test` passes. (see [development setup](#development-setup))

- If adding a new feature:
  - Add accompanying test case.
  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:
  - If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
  - Provide a detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

- Before you submit a pull request, make sure that your code conforms to all of the auto stylers that we use by running the command `npm run format`:
  - .prettierrc
  - .eslintrc.js
  - .editorconfig

- If you would like to request a code style change, you must justify your reason, provide the relevant rule for the config file and, get team approval.

- Be ready to do code walkthroughs for a reviewer before getting your changes merged.

## Development Setup

You will need [Node.js](http://nodejs.org) **version 18+

### Fork the project to your Github account

1. As a contributor, you will not have immediate access to the canonical repo. Therefore, you should fork the Celebrity-Falyzer repo to your own Github account first to give you full push/pull privileges with your local copy. To get the "Develop" branch (and not just the main), be sure to uncheck the option "Fork only the 'main' branch."
2. Globe&Citizen follows a `Main | Staging | Develop | Feature` branching structure. You will want to work off of the "Develop" branch. When you submit a Pull Request, it will be from your forked Github Repo to the branch "globe-and-citizen/develop."

### Install the dependencies

```bash
npm install
```

### The .env file

Celebrity Fanalyzer is a serverless build using Firebase for a backend.

Public development environment variables are available.
It is not necessary to configure anything related to this.

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run dev
```

### Test your code

Before submitting your PR you need to make sure that nothing has been broken.
For that, you need to run the tests:

#### Unit test

```bash
npm install -g firebase-tools # In case you don't have firebase-tools installed
npm run emulators
npm run test
```

#### E2E test

```bash
npm run dev:e2e # In case you don't have firebase-tools installed
npm run cy:open
```

### Committing Changes

Commit messages should follow the [commit message convention](https://www.conventionalcommits.org/en/v1.0.0/) so that changelogs can be automatically generated. Commit messages will be automatically validated upon commit.

### Commonly used NPM scripts

``` bash
# watch and auto re-build dist/vue.js
$ npm run dev

# watch and auto re-run unit tests in Chrome
$ npm run dev:test

# build all dist files, including npm packages
$ npm run build

# run the full test suite, including linting/type checking
$ npm test
```

There are some other scripts available in the `scripts` section of the `package.json` file.

The default test script will do the following: lint with ESLint -> type check with Flow -> unit tests with coverage -> e2e tests.
**Please make sure to have this pass successfully before submitting a PR.
** Although the same tests will be run against your PR on the CI server, it is better to have it working locally.

## Project Structure

- **`dist`
  **: contains built files for distribution. Note this directory is only updated when a release happens; they do not reflect the latest changes in development branches.

  See [dist/README.md](https://github.com/vuejs/vue/blob/dev/dist/README.md) for more details on dist files.

- **`test`
  **: contains all tests.

- **`src`
  **: contains the source code. The codebase is written in ES2015 with [Flow](https://flowtype.org/) type annotations.

## Credits

Thank you to all the people who have already contributed to Globe&Citizen !
