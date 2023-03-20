/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

// ** This file is an example of how to write Cypress tests, you can safely delete it **

// This test will pass when run against a clean Quasar project
describe('Prompt Page', () => {
  it('Should open prompt of the month and click like button', () => {
    cy.viewport(1280, 800)
    cy.visit('/')
    cy.getByData('month-link')
      .find('img', { timeout: 10000 })
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
      .click()

    cy.location('pathname').should('eq', '/month')

    cy.get('.q-btn').eq(0).scrollIntoView().click({ force: true })
  })
})
