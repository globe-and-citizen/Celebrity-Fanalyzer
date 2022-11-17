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

### Install the dependencies

```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run dev
```

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

### Build the app for production

```bash
npm run build
```

### Deploy the app to Vercel

<!-- TODO: This process will be automated -->

```bash
npm run deploy
```

---

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

### Configure Progressive Web App

See [Configuring PWA](https://quasar.dev/quasar-cli-vite/developing-pwa/introduction).
