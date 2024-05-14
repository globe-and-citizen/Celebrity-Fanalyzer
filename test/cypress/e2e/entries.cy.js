/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

// ** This file is an example of how to write Cypress tests, you can safely delete it **

// This test will pass when run against a clean Quasar project
describe('Home page', () => {
  context('Roadmap Section', () => {
    // TODO : Remove Not needed again
    it('Testing accordion', () => {
      cy.viewport('macbook-16')
      // cy.visit('/2023/07/lorem-ipsum')
      cy.visit('/month')
      cy.scrollTo('bottom')
      cy.get('[data-test="entries"]')

      cy.visit('/month')
      cy.get('[href="/search"]').click()
      cy.get('[href="/month"]').click()
      cy.get('[data-test="main-menu"] > .q-tabs__content > .q-tab--active').click()
    })
  })
})
