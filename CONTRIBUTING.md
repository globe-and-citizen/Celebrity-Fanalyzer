# Contributing

## Tips on Submiting Pull Requests

1. When you write your Commit messages, please adhere to [CommitConventions](https://www.conventionalcommits.org/en/v1.0.0/)
2. Before you submit a pull request, make sure that your code conforms to all of the auto stylers that we use by running the command `npm run format`:
   - .prettierrc
   - .eslintrc.js
   - .editorconfig
3. If you would like to request a code style change, you must justify your reason, provide the relevant rule for the config file and, get team approval.
4. Be ready to do code walkthroughs for a reviewer before getting your changes merged.
5. Other...

## How to run the project

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

### Good commit practices

Use semantic commits like the ones described below:

- Feat: new feature in the project, example: functionality, service, endpoint, etc;
- Refactor: refactoring some part of the code;
- Fix: correction of errors that are causing bugs;
- Test: creating or changing some code of test;
- Perf: changes made to improve the performance of the project, for example: improve the database query, make a function more performant, etc;
- Docs: changes in the project's documentation, for example: readme, contributing, etc;
- Chore: changes that do not influence the system or test files, example: adding files to git ignore, eslint changes, etc;
- Style: changes in formatting or code style that do not influence the logic of the system;
- Build: changes that impact the process of build.

## Test your code

Before submitting your PR you need to make sure that nothing has been broken.
For that, you need to run the tests:

#### Unit test

```bash
npm run test
```

#### E2E test

```bash
npm run dev
npm run cy:open
```

### Create a Pull request

Once you're done developing your updates, `git push` your changes back to your personal branch.
Then, open a Pull Request to merge your branch into the 'develop' branch of the 'globe-and-citizen/Celebrity-Fanalyzer' repo.
Respond and engage with feedback from the team as appropriate.

## How to prettify the code

### Lint the files

```bash
npm run lint
```

### Format the files

```bash
npm run format
```

## How to build and deploy your changes

Currently there is no need to build and deploy the application.
After your commit and push, the build will be done automatically through a GitHub Action.
Firebase will then create a unique URL for your Pull Request.

---
