/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />

describe('User Navigation', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    cy.visit('/')

    cy.get('h2').contains('Welcome to Celebrity Fanalyzer!')

    // Create alias @month-link
    cy.get('[data-test="month-link"]')
      .find('img')
      .should('be.visible')
      .and(($img) => expect($img[0].naturalWidth).to.be.greaterThan(0)) // "naturalWidth" and "naturalHeight" are set when the image loads
      .as('month-link')
  })

  it('Should display properly and navigate between pages', () => {
    cy.visit('/profile')
    cy.get('[data-test="main-menu"]').find('a').eq(1).click()
    cy.location('pathname').should('eq', '/search')

    cy.get('[data-test="main-menu"]').find('a').eq(3).click()
    cy.location('pathname').should('eq', '/profile')
  })

  it('Should Be able to navigate to month page, like and dislike a prompt', () => {
    cy.visit('/profile')
    cy.getByData('anonymous-button').click()
    cy.get('[data-test="main-menu"]').find('a').eq(2).click()

    cy.get('[data-test="like-button"]').should('not.have.attr', 'disabled')
    cy.get('[data-test="dislike-button"]').should('not.have.attr', 'disabled')

    // Like
    cy.get('[data-test="like-button"]').click({ force: true })
    cy.wait(10000)

    // Select the amount of likes to see if its value is greater than 0
    cy.get('[data-test="like-button"] > .q-btn__content > .block').invoke('text').then(parseFloat).should('be.greaterThan', 0)

    // Dislike

    cy.get('[data-test="dislike-button"]').click({ force: true })

    // Select the amount of dislikes to see if its value is greater than 0
    cy.get('[data-test="dislike-button"] > .q-btn__content > .block').invoke('text').then(parseFloat).should('be.greaterThan', 0)
  })
})
