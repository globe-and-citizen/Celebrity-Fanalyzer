/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

describe('Login and Signup Flow', () => {
  // Runs before each test to set the viewport and visit the root URL
  beforeEach(() => {
    cy.viewport('macbook-16')
    cy.visit('/profile')
  })

  it('should allow the user to switch between Sign In and Sign Up tabs', () => {
    // Test the ability to switch between tabs
    cy.get('[data-test="signin-tab"]').click() // Clicks the "Sign In" tab
    cy.get('[data-test="email-field"]').should('be.visible') // Ensures email field is visible
    cy.get('[data-test="password-field"]').should('be.visible') // Ensures password field is visible

    cy.get('[data-test="signup-tab"]').click() // Switch to "Sign Up" tab
    cy.get('[data-test="name-field"]').should('be.visible') // Checks "Name" field visibility
    cy.get('[data-test="username-field"]').should('be.visible') // Checks "Username" field visibility
    cy.get('[data-test="email-field"]').should('be.visible') // Checks "Email" field visibility
    cy.get('[data-test="password-field"]').should('be.visible') // Checks "Password" field visibility
  })

  it('should validate email and password during Sign In', () => {
    // Test validation for email and password
    cy.get('[data-test="email-field"]').type('invalid-email') // Inputs invalid email
    cy.get('[data-test="password-field"]').type('123') // Inputs invalid password
    cy.get('[data-test="sign-button"]').click() // Clicks the "Sign In" button
    cy.contains('Invalid Email').should('be.visible') // Checks for email validation error
    cy.contains('Invalid Password').should('be.visible') // Checks for password validation error
  })

  it('should show a success notification for valid Sign In', () => {
    // Test a successful sign-in and logout process
    cy.visit('/profile')
    cy.get('[data-test="email-field"]').type('test@test.com') // Inputs a valid email
    cy.get('[data-test="password-field"]').type('12345678') // Inputs a valid password
    cy.get('[data-test="sign-button"]').click().wait(1000) // Clicks the "Sign In" button

    cy.get('[data-test="tab-settings"]').click()
    // Verify user is logged in by checking their profile email visibility
    cy.get('[data-test="profile-email"]').should('have.value', 'test@test.com')

    // Logs out the user
    cy.get('[data-test="logout-button"]').click() // Clicks the logout button

    // Verifies redirection to the login page and visibility of the auth card
    cy.url().should('include', '/profile')
    cy.get('[data-test="auth-card"]').should('exist')
  })

  it('should validate reset password from the dialog', () => {
    // Test reset password dialog with invalid email
    cy.get('[data-test="signin-tab"]').click() // Switches to "Sign In" tab
    cy.get('[data-test="forgot-password-button"]').click() // Opens the reset password dialog
    cy.get('[data-test="reset-email-field"]').type('invalid-email') // Inputs invalid email
    cy.get('button').contains('Ok').click() // Clicks the "Ok" button
    cy.contains('Invalid Email').should('be.visible') // Checks for email validation error
    cy.get('[data-test="reset-email-field"]').clear() // Inputs clear
    cy.get('[data-test="reset-email-field"]').type('invalid@test.com') // Inputs an invalid email
    cy.get('button').contains('Ok').click() // Clicks the "Ok" button
    cy.contains('This email does not exist').should('be.visible') // Verifies error message
  })

  it('should reset password from the dialog', () => {
    // Test reset password dialog with a valid email
    cy.get('[data-test="signin-tab"]').click() // Switches to "Sign In" tab
    cy.get('[data-test="forgot-password-button"]').click() // Opens the reset password dialog
    cy.get('[data-test="reset-email-field"]').type('test@test.com') // Inputs a valid email
    cy.get('button').contains('Ok').click() // Clicks the "Ok" button
    cy.contains('Password reset link sent. Please check your email.').should('be.visible') // Verifies success message
  })
})
