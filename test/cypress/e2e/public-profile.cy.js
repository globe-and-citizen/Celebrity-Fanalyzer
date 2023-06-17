/// <reference types="cypress" />

describe('Accessing a Public Profile', () => {
  it('Should navigate to a public profile page', () => {
    // Visits the month page
    cy.visit('/month')

    // Selects the author section on the page and clicks it
    cy.get('[data-test="author-section"]').click()

    // Waits for the posts card on the page to load and checks if it has at least 1 post
    cy.get('[data-test="posts-section"]', { timeout: 10000 }).should('have.length.at.least', 1)
  })
})
