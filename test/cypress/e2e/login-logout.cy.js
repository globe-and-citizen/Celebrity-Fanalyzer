/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

describe('Login page', () => {
  context("login then", () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/profile')
      cy.getByData('login-button').click()
    })

    it('Should navigate between Profiles tabs', () => {
      cy.getByData('tab-settings', {timeout: 10000}).click()
      cy.getByData('tab-feedback').click()
      cy.getByData('tab-profile').click()
    })
    it('Logout', () => {
      cy.getByData('tab-settings', {timeout: 10000}).click()
      cy.getByData('logout-button').click()
    })
  })

})

