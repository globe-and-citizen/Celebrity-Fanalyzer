/// <reference types="cypress" />

describe('Accessing a Public Profile', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')

  })

  it('Should Visite to a public profile page', () => {
    // Visits the month page
    cy.visit('/fan/cypress')
    // Waits for the posts card on the page to load and checks if it has at least 1 post
    cy.get('[data-test="posts-section"]').should('have.length.at.least', 1)
    cy.location('pathname').should('eq', '/fan/cypress')
  })
  it('Should Visit a non existing public profile page', () => {
    // Visits the month page
    cy.visit('/fan/cypressNotExist')
    cy.get('.q-notification__message').contains('There is not user with the username :')
    cy.location('pathname').should('eq', '/404')
  })
})
