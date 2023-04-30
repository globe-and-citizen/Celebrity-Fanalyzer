# Globe&Citizen Contributing Guide

Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

- [Code of Conduct](https://github.com/globe-and-citizen/Celebrity-Fanalyzer/.github/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines (link under dev)](#)
- [Pull Request Guidelines (link under dev)](#)
- [Development Setup (link under dev)](#)
- [Project Structure (link under dev)](#)

## Issue Reporting Guidelines

### Before You Start...

The issue list is reserved exclusively for bug reports and feature requests. That means we do not accept usage questions. If you open an issue that does not conform to the requirements,
**it will be closed immediately**.

For usage questions, please use the following resources:

- Join our discord chanel

Also try to search for your issue - it may have already been answered or even fixed in the development branch. However, if you find that an old, closed issue still persists in the latest version, you should open a new issue instead of commenting on the old issue.

### The reason behind our strict issue policy

Maintaining open source projects, especially popular ones, is much work.

As a free and open source project, we also has limited maintainer bandwidth. That means the only way to ensure the project's sustainability is to:

1. Prioritize more concrete work (bug fixes and new features);
2. Improve issue triaging efficiency. For (1), we have decided to use the GitHub issue lists exclusively for work that has well-defined, actionable goals. Questions and open ended discussions should be posted to discord that are better suited for them.

## Pull Request Guidelines

- The `main` branch is just a snapshot of the latest stable release. All development should be done in dedicated branches.
  **Do not submit PRs against the `main` branch.**

- Checkout a topic branch from the relevant branch, e.g. `develop`, and merge back against that branch.

- Work in the `src` folder and **DO NOT** checkin `dist` in the commits.

- It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.

- Make sure all tests pass.

- If adding a new feature:

  - Add accompanying test case.
  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:

  - If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
  - Provide a detailed description of the bug in the PR.
  - Add appropriate test coverage if applicable.

- Before you submit a pull request, make sure that your code conforms to all of the auto stylers that we use by running the command `npm run format`:

  - .prettierrc
  - .eslintrc.js
  - .editorconfig

- If you would like to request a code style change, you must justify your reason, provide the relevant rule for the config file and, get team approval.

- Be ready to do code walkthroughs for a reviewer before getting your changes merged.

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run dev
```

### Committing Changes

Commit messages should follow the [commit message convention](https://www.conventionalcommits.org/en/v1.0.0/) so that changelogs can be automatically generated. Commit messages will be automatically validated upon commit.

There are some other scripts available in the `scripts` section of the `package.json` file.

## Credits

Thank you to all the people who have already contributed to Globe&Citizen !
