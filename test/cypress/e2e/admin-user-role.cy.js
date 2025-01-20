/// <reference types="cypress" />

describe('Admin User Role Change', () => {
  beforeEach(() => {
    cy.viewport('macbook-16')
    // Visits the profile page
    cy.login()
    cy.visit('/admin')
  })

  it('should change the role of roletest@email.com', () => {
    // Visit the page where the user table is rendered
    cy.get('[data-test="users-tab"]').click()
    // cy.wait(2000)

    // Wait for the table to load
    cy.get('.custom-table').should('be.visible')

    // Search for the user by email 'roletest@email.com'
    cy.get('[data-test="query-input"]').type('roletest@email.com')

    // Wait for the table to filter (depending on your debounce, adjust as needed)
    // cy.wait(1200)

    // Assert that the user is found in the table
    cy.contains('roletest@email.com').should('exist')

    // Find the row containing the email, and target the q-select dropdown
    cy.get('tr').contains('roletest@email.com').parent().find('[data-test="role-select"]').click()

    // Make sure the dropdown options are visible, then select 'Admin'
    cy.get('.q-item__label').contains('Admin').click()

    // cy.wait(10000)

    // Assert that the role has been updated to 'Admin'
    cy.get('tr').contains('roletest@email.com').parent().find('.q-field__native').contains('Admin')

    cy.get('tr').contains('roletest@email.com').parent().find('[data-test="role-select"]').click()

    // Make sure the dropdown options are visible, then select Previos one
    cy.get('.q-item__label').contains('User').click()
  })
})
