/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />

describe('Search page', () => {
  it('Testing search of prompt', () => {
    cy.viewport(1280, 800)
    cy.visit('/search')

    cy.get('[data-test="search-input"]').type(' ')
    cy.get('[data-test="item-link"]').first().click({ force: true })
    cy.wait(1000)
    cy.get('[data-test="title"]').should('have.text', 'Prompt Page')
  })
})
