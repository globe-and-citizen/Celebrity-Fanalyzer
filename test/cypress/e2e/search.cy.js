/// <reference types="cypress" />

describe('Search page', () => {
  it('Testing search of prompt', () => {
    cy.viewport(1280, 800)
    cy.visit('/search')

    cy.get('[data-test="search-input"]').type(' ')
    cy.get('[data-test="prompt-card"] > :first-child').click()
    cy.get('[data-test="title"]').should('have.text', 'Prompt Page')
  })
})
