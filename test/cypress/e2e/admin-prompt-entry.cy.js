/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

describe('Admin Prompt & Entry', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    // Visits the profile page
    cy.visit('/profile')

    // Get the login button and click it
    cy.get('.q-page > .q-btn').click()

    // Visits the admin page and wait for 15 seconds
    cy.get('[data-test="main-menu"]').find('a').eq(4).click()
    cy.location('pathname').should('eq', '/admin')
  })

  it('Should create a prompt', () => {
    // Get the dropdown button and click it
    cy.get('[data-test="button-dropdown"]').click()

    // Get the first button (New Prompt) and click it
    cy.get('[data-test="prompt-dropdown"]').should('be.visible').click()
    cy.get('.q-card.not-loading')

    // Get the date input and choose the last option
    cy.get('[data-test="date-picker"]').should('be.visible').click()
    cy.get('.q-date__view > :nth-child(13)').click()
    cy.get('span.block').eq(14).click()

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
    cy.get('[data-test="button-submit"] > .q-btn__content').click()
    // cy.get('[data-test="button-submit"]').click()

    //Check the Prompt is submitted successfully
    cy.get('.q-notification__message').contains('Prompt successfully submitted')
  })

  it.only('Should create a entry', () => {
    // Get the dropdown button and click it
    cy.get('[data-test="button-dropdown"]').click()

    // Get the first button (New Entry) and click it
    cy.get('[data-test="entry-dropdown"]').click()

    // Get the author select and choose the "TESTER" option
    cy.get('[data-test="select-author"]').select('TESTER')

    // Get the prompt select and choose the "Hello World!" option
    cy.get('[data-test="select-prompt"]').select('Hello World!')

    // Get the title input and type 'Hello World!' into it
    cy.get('[data-test="input-title"]').type('Hello World!')

    // Get the description input and type 'This is a sample entry' into it
    cy.get('[data-test="input-description"]').type('This is a sample entry')

    // Get the file image input and upload the Cypress logo
    cy.get('[data-test="file-image"]').selectFile('src/assets/cypress.jpg')

    // Get the submit button and click it
    cy.get('[data-test="button-submit"]').click()

    // Check the Entry is submitted successfully
    cy.get('.q-notification__message').contains('Entry successfully submitted')
  })

  it('Should delete the entry', () => {
    // Get the second button (Delete Entry) and click it
    cy.get('[data-test="input-search"]').type('TESTER').wait(1000)

    // Get the expand button and click it
    cy.get('[data-test="button-expand"]').click({ timeout: 1000 })

    // Get the delete button and click it
    cy.get('[data-test="button-delete-entry"]').click({ timeout: 1000 })

    // Get the confirm button and click it
    cy.get('[data-test="confirm-delete-entry"]').click({ timeout: 1000 })
  })

  it('Should delete the prompt', () => {
    // Get the second button (Delete Prompt) and click it
    cy.get('[data-test="input-search"]').type('TESTER').wait(1000)

    // Get the delete button and click it
    cy.get('[data-test="button-delete-prompt"]').click({ timeout: 1000 })

    // Get the confirm button and click it
    cy.get('[data-test="confirm-delete-prompt"]').click({ timeout: 1000 })
  })
})
