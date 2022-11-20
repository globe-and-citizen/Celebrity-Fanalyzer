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

### Add a .env file
Celebrity Fanalyzer is a serverless build using Firebase for a backend. To successfully run the project, you'll need a backend to connect to. In the top level domain, of the project, create a ".env" file.

Add the following to the file that will connect your local app to a development back end.

```
# DEVELOPMENT FIREBASE CONFIG
VITE_FIREBASE_API_KEY=''
VITE_FIREBASE_AUTH_DOMAIN=''
VITE_FIREBASE_PROJECT_ID=''
VITE_FIREBASE_STORAGE_BUCKET=''
VITE_FIREBASE_MESSAGING_SENDER_ID=''
VITE_FIREBASE_APP_ID=''
RELEASE_STAGE='development'
```

Reach out to one of the team to get official numbers. Alternatively, you can easily launch a Firebase instance of your own.

(Note* at present you will need to be manually added to the project as an admin after signing up. This will be updated shortly.)  

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run dev
```

### Create a Pull request

Once you're done developing your updates, `git push` your changes back to your personal, remote, repo: <user-name>/Celebrity-Fanalyzer. 
Next, open a Pull Request to merge your branch into the 'develop' branch of the 'globe-and-citizen/Celebrity-Fanalyzer' repo. 
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
