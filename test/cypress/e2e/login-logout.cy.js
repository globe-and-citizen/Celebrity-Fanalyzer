/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

describe('Login page', () => {
  context('login then', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/profile')

      // Fill the email and password fields and click the sign in button
      cy.get('[data-test="email-field"]').type('test@test.com')
      cy.get('[data-test="password-field"]').type('12345678')
      cy.get('[data-test="sign-button"]').click()
    })

    it('Should navigate between Profiles tabs', () => {
      cy.getByData('tab-settings').click({force:true})
      cy.getByData('tab-feedback').click()
      cy.getByData('tab-profile').click()
    })
    it('Logout', () => {
      cy.getByData('tab-settings').click({force:true})
      cy.getByData('logout-button').click()
    })
  })
})
