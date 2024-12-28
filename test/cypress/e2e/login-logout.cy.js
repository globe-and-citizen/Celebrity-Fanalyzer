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
    // Clicks the "Sign In" tab
    cy.get('[data-test="signin-tab"]').click()
    // Ensures email field is visible
    cy.get('[data-test="email-field"]').should('be.visible')
    // Ensures password field is visible
    cy.get('[data-test="password-field"]').should('be.visible')

    // Switch to "Sign Up" tab
    cy.get('[data-test="signup-tab"]').click()
    // Checks "Name" field visibility
    cy.get('[data-test="name-field"]').should('be.visible')
    // Checks "Username" field visibility
    cy.get('[data-test="username-field"]').should('be.visible')
    // Checks "Email" field visibility
    cy.get('[data-test="email-field"]').should('be.visible')
    // Checks "Password" field visibility
    cy.get('[data-test="password-field"]').should('be.visible')
  })

  it('should validate email and password during Sign In', () => {
    // Test validation for email and password
    // Inputs invalid email
    cy.get('[data-test="email-field"]').type('invalid-email')
    // Inputs invalid password
    cy.get('[data-test="password-field"]').type('123')
    // Clicks the "Sign In" button
    cy.get('[data-test="sign-button"]').click()
    // Checks for email validation error
    cy.contains('Invalid Email').should('be.visible')
    // Checks for password validation error
    cy.contains('Invalid Password').should('be.visible')
  })

  it('should show a success notification for valid Sign In', () => {
    // Test a successful sign-in and logout process
    cy.visit('/profile')
    // Inputs a valid email
    cy.get('[data-test="email-field"]').type('test@test.com')
    // Inputs a valid password
    cy.get('[data-test="password-field"]').type('12345678')
    // Clicks the "Sign In" button
    cy.get('[data-test="sign-button"]').click()

    cy.get('[data-test="tab-settings"]').click()
    // Verify user is logged in by checking their profile email visibility
    cy.get('[data-test="profile-email"]').should('have.value', 'test@test.com')

    // Logs out the user
    // Clicks the logout button
    cy.get('[data-test="logout-button"]').click()
    // Verifies redirection to the login page and visibility of the auth card
    cy.url().should('include', '/profile')
    cy.get('[data-test="auth-card"]').should('exist')
  })

  it('should validate reset password from the dialog', () => {
    // Test reset password dialog with invalid email
    // Switches to "Sign In" tab
    cy.get('[data-test="signin-tab"]').click()
    // Opens the reset password dialog
    cy.get('[data-test="forgot-password-button"]').click()
    // Inputs invalid email
    cy.get('[data-test="reset-email-field"]').type('invalid-email')
    // Clicks the "Ok" button
    cy.get('button').contains('Ok').click()
    // Checks for email validation error
    cy.contains('Invalid Email').should('be.visible')
    // Inputs clear
    cy.get('[data-test="reset-email-field"]').clear()
    // Inputs an invalid email
    cy.get('[data-test="reset-email-field"]').type('invalid@test.com')
    // Clicks the "Ok" button
    cy.get('button').contains('Ok').click()
    // Verifies error message
    cy.contains('This email does not exist').should('be.visible')
  })

  it('should reset password from the dialog', () => {
    // Test reset password dialog with a valid email
    // Switches to "Sign In" tab
    cy.get('[data-test="signin-tab"]').click()
    // Opens the reset password dialog
    cy.get('[data-test="forgot-password-button"]').click()
    // Inputs a valid email
    cy.get('[data-test="reset-email-field"]').type('test@test.com')
    // Clicks the "Ok" button
    cy.get('button').contains('Ok').click()
    // Verifies success message
    cy.contains('Password reset link sent. Please check your email.').should('be.visible')
  })

  it('should validate fields during Sign Up', () => {
    // Switch to Sign Up tab
    cy.get('[data-test="signup-tab"]').click()

    // Test Name field validation
    // Input short name
    cy.get('[data-test="name-field"]').type('S')
    // Click "Sign Up"
    cy.get('[data-test="sign-button"]').click()
    // Check for name validation error
    cy.contains('Invalid Name').should('be.visible')

    // Inputs invalid email
    cy.get('[data-test="email-field"]').type('invalid-email')
    // Click "Sign Up"
    cy.get('[data-test="sign-button"]').click()
    // Checks for email validation error
    cy.contains('Invalid Email').should('be.visible')

    // Test Username field validation (invalid username)
    // Input too short username
    cy.get('[data-test="username-field"]').type('ab')
    // Click "Sign Up"
    cy.get('[data-test="sign-button"]').click()
    // Check for username length error
    cy.contains('Username must be between 3 and 20 characters long').should('be.visible')
    // Input UnAvailable username
    cy.get('[data-test="username-field"]').clear()
    cy.get('[data-test="username-field"]').type('Cypress Tester')
    // Click "Sign Up"
    cy.get('[data-test="sign-button"]').click()
    // Check for username length error
    cy.contains('Username already taken').should('be.visible')
    // Test Password field validation (too short)
    // Input too short password
    cy.get('[data-test="password-field"]').type('123')
    // Click "Sign Up"
    cy.get('[data-test="sign-button"]').click()
    // Check for password validation error
    cy.contains('Invalid Password').should('be.visible')
  })
})
