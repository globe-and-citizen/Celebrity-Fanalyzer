/* eslint-disable cypress/unsafe-to-chain-command */
/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

describe('Admin Prompt & Entry', () => {
  beforeEach(() => {
    cy.viewport('macbook-16')
    // Visits the profile page

    cy.login()
    cy.visit('/admin')
  })
  // it.only('display', () => {
  //   cy.get('[data-test="entriesFetched"]')
  // })
  it('Should create a prompt', () => {
    // Get the dropdown button and click it
    cy.get('[data-test="button-dropdown"]').click()

    // Get the first button (New Prompt) and click it
    cy.get('[data-test="prompt-dropdown"]').should('be.visible').click()
    cy.get('.q-card.not-loading')

    // Get the date input and choose the last option
    cy.get('[data-test="date-picker"]').should('be.visible').click()
    cy.get('.q-date__view > .no-wrap > :nth-child(1) > .q-btn > .q-btn__content').click()
    cy.get('.q-date__view > :nth-child(2)').click()
    cy.get('[data-test="close"]').click()

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

  it('Should create a entry', () => {
    // Get the dropdown button and click it
    cy.get('[data-test="button-dropdown"]').click().wait(4000)

    // Get the first button (New Entry) and click it
    cy.get('[data-test="entry-dropdown"]').click()

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
    cy.get('[data-test="input-search"]').type('tester')
    // Get the expand button and click it
    cy.get('[data-test="2022-01"] > .q-table--col-auto-width > [data-test="button-expand"]').click()
    // Delete all entry in a prompt and left one
    cy.get('[data-test="button-delete-entry"]').then(($btn) => {
      for (let i = $btn.length - 1; i > 0; i--) {
        cy.get('[data-test="button-delete-entry"]').eq(i).click({ force: true })
        cy.get('[data-test="confirm-delete-entry"]').click()
        // Wait the notification
        cy.get('.q-notification__message').contains('Entry deleted')
        cy.wait(4000)
      }
    })
    cy.wait(4000)

    // Delete the last one
    cy.get('[data-test="button-delete-entry"]').eq(0).click({ force: true })
    cy.get('[data-test="confirm-delete-entry"]').click()
    // Wait the notification
    cy.get('.q-notification__message').contains('Entry deleted')
  })

  it('Should delete the prompt', () => {
    // Get the second button (Delete Prompt) and click it
    cy.get('[data-test="input-search"]').type('Cypress Tester').wait(1000)

    // Get the delete button and click it
    cy.get('[data-test="2022-01"] > .text-right > [data-test="button-delete-prompt"]').click()

    // Get the confirm button and click it
    cy.get('[data-test="confirm-delete-prompt"]').click()
    // Wait the notification
    cy.get('.q-notification__message').contains('Prompt successfully deleted')
  })
})
