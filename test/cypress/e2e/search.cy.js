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

  it('Should open and close the filter dialog', () => {
    cy.login()
    cy.wait(1000)
    cy.visit('/search')
    cy.get('[data-test="filter-button"]').click()
    cy.get('.filter-card').should('exist')
    cy.get('.filter-title').should('contain', 'Filter By')

    cy.get('[data-test="date-picker"]').click()
    cy.get('[data-test="close"]').click()
    cy.wait(1000)
    cy.get('input[data-test="date"]').type('202412')
    cy.get('[data-test="apply-filter-btn"]').click()

    cy.get('.filter-card').should('not.exist')
  })
})
