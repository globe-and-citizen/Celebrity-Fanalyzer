# Setup Instructions

### Requirements:

- **Node.js**: v16 or higher (v20 is recommended)
- **NPM**: v6.13.4 or higher
- **Yarn** v1.21.1 or higher

### Installation:

1. Clone the repository:

As a contributor, you will not have immediate access to the canonical repo. Therefore, you should fork the Celebrity-Falyzer repo to your own Github account first to give you full push/pull privileges with your local copy. To get the "Develop" branch (and not just the main), be sure to uncheck the option "Fork only the 'main' branch."

```bash
git clone https://github.com/globe-and-citizen/Celebrity-Fanalyzer.git
cd celebrity-fanalyzer
```

2. Install dependencies

```bash
npm install
```

3. The .env file

Celebrity Fanalyzer is a serverless build using Firebase for a backend.
Public development environment variables are available.
It is not necessary to configure anything related to this.

4.  To start development with PWA support

```bash
npm run dev
```

5. To build the project for production

```bash
npm run build
```

# Contributing to Celebrity Fanalyzer

#### _We appreciate your interest in contributing to Celebrity Fanalyzer! Please follow these guidelines to help maintain a high-quality codebase and ensure smooth collaboration._

## Code standards

We enforce coding standards to ensure readability, maintainability and consistency across the project. Please adhere to the following rules:

<details><summary>Some common basic rules to be kept in mind to write clean code:</summary>

- Use the DRY principle (Don’t repeat yourself).
- Create multiple files instead of writing a big file. (Componentization of code: fix to small functionality for each file)
- Place all your CSS files in one common folder.
- Avoid Inline CSS as and when possible (a CSS class should be created when there are more than 2 CSS attributes).
- Use a linter to make your code easier to review. Follow strict linting rules. This in turn helps you write clean, consistent code.
- Review your code before creating a pull request.
- Split your code into multiple smaller functions. Each with a single responsibility.
- Create many utility files that can help you remove duplicate code from multiple files.
- Separate all your service calls into a separate file. If it’s a big project try to split the services into multiple files. (name convention module_name.service.js).
- Name your files logically according to the job that they perform.
- Clean code is self-commenting(using the right variable names and function names). Use comments only to explain complex functions.
- Always write test cases for your code. Keep tests files in sync with the files they are testing.
- Destructuring your props is a good way to help make your coder cleaner and more maintainable.
  For example (async function authenticate({ user_id, token }) {})
- Putting imports in an order

  - Vue imports
  - Library imports (Alphabetical order)
  - Absolute imports from the project (Alphabetical order)
  - Relative imports (Alphabetical order)
  - Import \* as
  - Import ‘./<some file>.<some extension>

  Each kind should be separated by an empty line. This makes your imports clean and easy to understand for all the components, 3rd-party libraries, and etc.

</details>

#### ESLint:

- The project uses **ESLint** to ensure code consistency.
- **All code must pass ESLint** before it can be commited.
- If you need to disable any ESLint rule, justify it using comments.

ESLint will run automatically on each commit.

To run ESLint manually:

```bash
npm run lint
```

To let ESLint try automatically fix ESLint issues:

```bash
npm run lint:fix
```

#### Prettier:

We use Prettier to format code automatically. The formatting will be checked on each commit.

To format your code:

```bash
npm run format
```

## Pull Request Guidelines

### What kind of Pull Requests are accepted?

1. Single Responsibility Principle of a Pull Request
2. Title and Description of a Pull Request & Pull Request Templates. You can find and use Pull Request Template in `pull_request_template.md`
3. Comment your code, mostly in hard-to-understand areas
4. It is the author’s duty to test the code before PR
5. If you would like to request a code style change, you must justify your reason, provide the relevant rule for the config file and get team approval.
6. Be ready to do code walkthroughs for a reviewer before getting your changes merged.
7. Other...

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

## Deployment

Currently there is no need to build and deploy the application.
After your commit and push, the build will be done automatically through a GitHub Action.
Firebase will then create a unique URL for your Pull Request.

---
