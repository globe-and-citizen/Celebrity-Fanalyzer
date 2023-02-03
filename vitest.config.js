import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import jsconfigPaths from 'vite-jsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: 'test/vitest/setup-file.js',
    include: [
      // Matches vitest tests in any subfolder of 'src' or into 'test/vitest/__tests__'
      // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
      'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.spec.js'
    ]
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/quasar-variables.scss'
    }),
    jsconfigPaths()
  ]
})

/**
 * 1.	Install dependencies
 * 2.	Run <npx quasar ext add @quasar/testing-unit-vitest>
 * a.	Choose “Extras” only (for now)
 * 3.	In “./vitest.config.js” change environment to ”jsdom” (instead of happy-dom)
 * 4.	Run “npm run test”
 * 5.	[Optional] delete the folder “test\vitest” or keep it for reference.
 * 6. Modify the firebase.js file ('./src/firebase.js') by adding the following if check:
 * 7. Also, make sure the imports in firebase.js are uptodate
 *

import { getAnalytics, isSupported } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { useUserStore } from './stores/user'

const localTestingEnvFlag = true
if (localTestingEnvFlag) {
  // is[Analytics]Supported?
  isSupported().then((res)=>{
    if(res) getAnalytics(app)
  })
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8000)
  connectStorageEmulator(storage, 'localhost', 9199)

  // onAuthStateChanged(auth, async (_user) => {
  //   if (_user) {
  //     const userStore = useUserStore()
  //     userStore.fetchUserProfile(_user)
  //   } else {
  //     console.log("authStateChange event fired but no user logged in.")
  //   }
  // })
}

 * 7. modify "./firebase.json" by adding the following object at the top level below "hosting"

"emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8000
    },
    "hosting": {
      "port": 5000
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true
    }
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }

 * 8. add the file, "./storage.rules" to the top level domain
  rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth!=null;
    }
  }
}

 * 9. Add the file, "./firebase.rules" to the top level domain
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

* 10. Make sure the cache of your local storage is cleared
* 11. rename "./.env.development" to just ".env"
* 12. make sure that the statement: import { doc, getDoc, runTransaction } from '@firebase/firestore' have the '@' symbol removed to read import { doc, getDoc, runTransaction } from 'firebase/firestore'
*/

//11. Add the line "src/**/*.spec.js" to vitest.config.js
