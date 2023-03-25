/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

// ** This file is an example of how to write Cypress tests, you can safely delete it **

// This test will pass when run against a clean Quasar project
describe('Prompt Content Management', () => {
  context("login then Navigate to admin panel", () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/profile')
      cy.getByData('login-button').click()
      cy.getByData('main-menu').find("a").eq(1).click()
      cy.location("pathname").should(
        "eq",
        "/search"
      )
      cy.getByData("prompt-list", {timeout: 100000}).find("article", {timeout: 10000})

      // Checkout Admin page
      cy.getByData('main-menu').find("a").eq(4, {timeout: 10000}).click()
      cy.location("pathname").should(
        "eq",
        "/admin"
      )
    })

    it.only('Should Create new Prompt then delet it', () => {
      const now = new Date(20221, 11, 14)
      cy.clock(now)
      cy.get('tbody>tr', {timeout: 100000}).should('be.visible', {timeout: 100000})
      cy.pause()
      cy.getByData('dropdown').click()
      cy.getByData('prompt-dropdown').click()
      // cy.getByData('date-picker').click()
      cy.getByData('date')//.type("2022-11", {fore: true})
    })
    // it('Logout', () => {
    //   cy.getByData('tab-settings', {timeout: 10000}).click()
    //   cy.getByData('logout-button').click()
    // })
  })

})

