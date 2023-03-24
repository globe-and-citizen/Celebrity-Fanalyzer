/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

// ** This file is an example of how to write Cypress tests, you can safely delete it **

// This test will pass when run against a clean Quasar project
describe('Admin Prompt', () => {
  beforeEach(() => {
    // Visits the profile page
    cy.visit('/profile')

    // Get the login button and click it
    cy.get('.q-page > .q-btn').click().wait(2000)

    // Visits the admin page and wait for 4 seconds
    cy.visit('/admin', { timeout: 10000 }).wait(5000)
  })

  it('Should create a prompt', () => {
    // Get the dropdown button and click it
    cy.get('.q-btn-dropdown').click().wait(1000)

    // Get the first button (New Prompt) and click it
    cy.get('[data-test="new-prompt"]').click().wait(1000)

    // Get the date input and choose the last option
    cy.get('[data-test="icon-date"]').click()
    cy.get('.q-date__view > :nth-child(13)').click()

    // Get the author select and choose the first option
    cy.get('[data-test="select-author"]').select('TESTER')

    // Get the title input and type 'Hello World!' into it
    cy.get('[data-test="input-title"]').type('Hello World!')

    // Get the description input and type 'This is a sample prompt' into it
    cy.get('[data-test="input-description"]').type('This is a sample prompt')

    // Get the file image input and upload the Cypress logo
    cy.get('[data-test="file-image"]').selectFile('src/assets/cypress.jpg')

    // Get the categories select and choose add 'Cypress' and 'Test' categories
    cy.get('[data-test="select-categories"]').type('Cypress{enter}').type('Test{enter}')

    // Get the submit button and click it
    cy.get('[data-test="button-submit"]').click().wait(3000)
  })

  it('Should delete the prompt', () => {
    // Get the second button (Delete Prompt) and click it
    cy.get('[data-test="input-search"]').type('TESTER', { timeout: 500 })

    // Get the delete button and click it
    cy.get('[data-test="button-delete-prompt"]').click().wait(1000)

    // Get the confirm button and click it
    cy.get('[data-test="confirm-delete-prompt"]').click().wait(2000)
  })
})
