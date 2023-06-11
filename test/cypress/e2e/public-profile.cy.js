/// <reference types="cypress" />

describe('Accessing a Public Profile', () => {
  it('Should navigate to a public profile page', () => {
    // Visits the month page and waits for 5 seconds for the page to load
    cy.visit('/month')

    // Selects the author section on the page and clicks it
    cy.get('[data-test="author-section"]').click()

    // Selects the posts card on the page and check if it has at least 1 post
    cy.get('[data-test="posts-section"]').should('have.length.at.least', 1)
  })
})
