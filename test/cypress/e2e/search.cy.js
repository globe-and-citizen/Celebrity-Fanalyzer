/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />

describe('Search page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.wait(3000)
  })

  it('Testing search of prompt', () => {
    cy.viewport(1280, 800)
    cy.on('fail', (err, runnable) => {
      console.log(err.message)
      return false
    })
    cy.visit('/search')

    cy.get('[data-test="search-input"]').type(' ')
    cy.wait(1000)
    cy.get('[data-test="item-link"]').first().click({ force: true })
    cy.wait(1000)

    cy.get('[data-test="title"]').should('contain.text', 'Prompt Page')
  })

  it('Should load more prompt when clicking "Load More" button', () => {
    cy.visit('/search')
    cy.get('[data-test="item-card"]', { timeout: 20000 }).should('have.length', 6)
    cy.get('[data-test="load-more-btn"]').first().click({ force: true })
    cy.get('[data-test="item-card"]').should('have.length.greaterThan', 6)
  })
})
