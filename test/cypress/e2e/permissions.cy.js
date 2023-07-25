/// <reference types="cypress" />

describe('Permissions', () => {
  beforeEach(() => {
    cy.viewport('macbook-16')
    // Visits the profile page

    cy.login()
    cy.visit('/admin')
  })

  it('Should check permissions of Admin Page and query an user', () => {
    // Get the dropdown button and check if it is visible
    cy.get('[data-test="button-dropdown"]').should('be.visible')

    // Get the Users tab and check if it is visible
    cy.get('[data-test="users-tab"]').should('be.visible').click()

    // Get the search input and query an user
    cy.get('[data-test="query-input"]').should('be.visible').type('Cypress', { force: true })

    // Get the user and check if it is visible
    cy.get('tbody > tr > :nth-child(1)').should('be.visible')
  })
})
