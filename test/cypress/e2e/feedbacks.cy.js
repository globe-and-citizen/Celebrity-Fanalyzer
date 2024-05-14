/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />

describe('Feedback page', () => {
  beforeEach(() => {
    cy.viewport('ipad-2')
    cy.login()
  })

  it('should send a feedback message to the admin', () => {
    cy.visit('/profile')
    cy.get('.q-icon').contains('feedback').click()

    cy.get('[data-test="subject-input"]').type('Test subject')
    cy.get('[data-test="message-input"]').type('Test message')
    cy.get('[data-test="submit-button"]').click()

    cy.get('.q-notification').should('be.visible')
  })

  it('should see the recent feedback in the admin page', () => {
    cy.visit('/admin')

    cy.get('[data-test="feedbacks-tab"]').click()

    cy.get('[data-test="user-div"]').first().should('have.text', 'Cypress Tester')
    cy.get('[data-test="feedback-message"]').first().should('have.text', 'Test message')
  })

  it('should delete the recent feedback in the admin page', () => {
    cy.visit('/admin')

    cy.get('[data-test="feedbacks-tab"]').click()
    cy.wait(1000)

    cy.get('[data-test="trash-button"] > .q-btn__content').first().click()
    cy.get('[data-test="delete-button"]').click()
    cy.wait(1000)

    cy.get('.q-notification').should('be.visible')
  })
})
