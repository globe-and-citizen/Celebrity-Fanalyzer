module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have a higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  parserOptions: {
    // Allows for the parsing of modern ECMAScript features
    ecmaVersion: '2021'
  },

  env: {
    node: true,
    browser: true,
    'vue/setup-compiler-macros': true
  },
  overrides: [
    {
      files: ['**/*.cy.{js,jsx,ts,tsx}'],
      extends: [
        // Add Cypress-specific lint rules, globals and Cypress plugin
        // See https://github.com/cypress-io/eslint-plugin-cypress#rules
        'plugin:cypress/recommended'
      ]
    }
  ],
  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    // 'eslint:recommended',

    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    // Priority A: Essential (Error Prevention)
    'plugin:vue/vue3-essential',
    // 'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
    // 'plugin:vue/vue3-recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)

    // https://github.com/prettier/eslint-config-prettier#installation
    // usage with Prettier, provided by 'eslint-config-prettier'.
    'prettier'
  ],

  plugins: [
    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-files
    // required to lint *.vue files
    'vue',
    'prettier'
    // https://github.com/typescript-eslint/typescript-eslint/issues/389#issuecomment-509292674
    // Prettier has not been included as plugin to avoid performance impact
    // add it as an extension for your IDE
  ],

  globals: {
    // Google Analytics
    ga: 'readonly',
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  },

  // add your custom rules here
  rules: {
    'prefer-promise-reject-errors': 'off',
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    eqeqeq: ['error', 'always'],
    'no-empty': 'error',
    'no-inline-comments': 'error',
    'no-var': 'error',
    'vue/no-unused-refs': 'error',
    'vue/no-restricted-syntax': 'error',
    'vue/no-console': 'error',
    'vue/no-empty-component-block': 'error',
    'vue/no-multi-spaces': 'error',
    'vue/no-unused-emit-declarations': 'error',
    'vue/no-unused-vars': [
      'error',
      {
        ignorePattern: '^_'
      }
    ],
    'prefer-const': 'error'
  }
}
