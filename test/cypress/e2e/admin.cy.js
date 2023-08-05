/// <reference types="cypress" />

describe('Manage Error', () => {
  beforeEach(() => {
    cy.viewport('macbook-16')
    // Visits the profile page

    cy.login()
    cy.visit('/admin')
  })

  it('Should check permissions of Admin Page and query an user', () => {
    // Get the dropdown button and check if it is visible
    cy.getByData('errors-tab').click()
    cy.getByData('errors-loaded').should('be.visible')
    cy.get(':nth-child(1) > .text-right > .q-btn > .q-btn__content')
    cy.getByData('delete-button').eq(0).click()
    cy.getByData('dialog').should('be.visible')
    cy.getByData('confirm-button').click()
    cy.get('.q-notification__message').contains('Error removed')
  })

  // TODO find a way to check when error occure
  it.skip('should have error', () => {
    cy.getByData('errors-tab').click()
    cy.getByData('errors-loaded').should('be.visible')
    cy.get(':nth-child(1) > .text-right > .q-btn > .q-btn__content')
    cy.getByData('delete-button').eq(0).click()
    cy.getByData('dialog').should('be.visible')
    cy.intercept('https://firestore.googleapis.com/**', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true',
      },
    }).as('firestore')
    // cy.get('@firestore')
    cy.getByData('confirm-button').click()
    cy.get('.q-notification__message').contains('Can\'t remove the Error')
  })
})
