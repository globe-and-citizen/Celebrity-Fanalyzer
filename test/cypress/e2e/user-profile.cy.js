/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />

describe('User Profile page', () => {
  beforeEach(() => {
    cy.viewport('macbook-16')
    // Visits the profile page
    cy.login()
    cy.visit('/profile')
  })
  it('Should user profile edit', () => {
    const name = 'Cypress Tester' + Math.random()

    // Get the edit Name input
    cy.get('[data-test="input-name"]').clear()
    cy.get('[data-test="input-name"]').type(name)

    // Get the copy username button and click it
    cy.get('[data-test="button-username-copy"]').click().wait(1000)

    //Check the Link copied to clipboard successfully
    cy.get('.q-notification__message').contains('Link copied to clipboard')

    // Get the edit UserName input
    cy.get('[data-test="input-user-name"]').clear()
    cy.get('[data-test="input-user-name"]').type('Cypress Tester').wait(1000)

    // Get the bio input and type 'User Bio Updated' into it
    cy.get('[data-test="input-bio"]').clear()
    cy.get('[data-test="input-bio"]').type('User Bio Updated')

    // Get the facebook input and type 'https://www.facebook.com/cypresstester' into it
    cy.get('[data-test="input-facebook"]').clear()
    cy.get('[data-test="input-facebook"]').type('https://www.facebook.com/cypresstester')

    // Get the instagram input and type 'https://www.instagram.com/cypresstester' into it
    cy.get('[data-test="input-instagram"]').clear()
    cy.get('[data-test="input-instagram"]').type('https://www.instagram.com/cypresstester')

    // Get the linkedin input and type 'https://www.linkedin.com/cypresstester' into it
    cy.get('[data-test="input-linkedin"]').clear()
    cy.get('[data-test="input-linkedin"]').type('https://www.linkedin.com/cypresstester')

    // Get the telegram input and type 'https://www.telegram.com/cypresstester' into it
    cy.get('[data-test="input-telegram"]').clear()
    cy.get('[data-test="input-telegram"]').type('https://www.telegram.com/cypresstester')

    // Get the X input and type 'https://www.x.com/cypresstester' into it
    cy.get('[data-test="input-x"]').clear()
    cy.get('[data-test="input-x"]').type('https://www.x.com/cypresstester')

    // Get the submit button and click it
    cy.get('[data-test="button-submit"] > .q-btn__content').click()

    //Check the Profile successfully updated
    cy.get('.q-notification__message').contains('Profile successfully updated')
  })

  it('if a user has Prompts & Entries Subscribe, they should unsubscribe', () => {
    cy.visit('/profile/subscriptions').wait(5000)
    // cy.get('[href="/profile"]').click().wait(2000)
    // cy.get('[href="/profile/subscriptions"]').click()

    // Check if the Prompts table exists and unsubscribe
    cy.get('.prompts-table').should('exist') // Ensure table exists
    cy.get('.prompts-table .q-tr')
      .should('have.length.greaterThan', -1)
      .then((tableRows) => {
        if (tableRows.length > 0) {
          cy.get('[data-test="prompt-unsubscribe"]').first().click().wait(1000) // Click the first unsubscribe button
        } else {
          cy.log('No prompts subscription found')
        }
      })

    // Check if the Entries table exists and unsubscribe
    cy.get('.entries-table').should('exist') // Ensure table exists
    cy.get('.entries-table .q-tr')
      .should('have.length.greaterThan', -1)
      .then((tableRows) => {
        if (tableRows.length > 0) {
          cy.get('[data-test="entrie-unsubscribe"]').first().click().wait(1000) // Click the first unsubscribe button
        } else {
          cy.log('No entries subscription found')
        }
      })
  })

  it('Should display the View Profile button and open the profile link in a new tab', () => {
    cy.intercept('GET', '**/user', {
      body: {
        username: 'Cypress Tester'
      }
    })
    cy.wait(4000)
    // Ensure the "View Profile" button is visible
    cy.get('[data-test="button-username-view-profile"]').should('exist').should('be.visible')

    // Stub the window.open method
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
    })
    // Click the button and verify the expected behavior
    cy.get('[data-test="button-username-view-profile"]').click()
    // Assert the new tab opens with the correct URL
    cy.get('@windowOpen').should('be.calledWith', `${window.location.origin}/fan/Cypress Tester`)
  })

  it('Should allow user to upload and delete profile picture', () => {
    // Step 1: Upload a profile picture
    cy.visit('/profile')

    // Open the upload dialog by clicking the avatar
    cy.get('[data-test="avatar-upload"]').click()

    // Ensure the dialog appears
    cy.get('[data-test="upload-dialog"]').should('be.visible')

    // Choose a file
    cy.get('[data-test="upload-file-input"]') // File input element in the dialog
      .selectFile('src/assets/cypress.jpg') // Path from the cypress/fixtures folder

    // Wait for the preview image to show
    cy.get('[data-test="upload-preview"]').should('be.visible')

    // Click the Save button in the dialog to upload the image
    cy.get('[data-test="upload-save-btn"]').click()
    cy.wait(5000) // Adjust wait time based on your app's image upload duration

    // Check if the profile was successfully updated after upload
    cy.get('.q-notification__message').contains('Profile successfully updated')

    // Delete the profile picture
    cy.get('[data-test="avatar-upload"]').click()

    // Ensure the dialog appears
    cy.get('[data-test="upload-dialog"]').should('be.visible')

    // Wait for the preview image to show
    cy.get('[data-test="upload-preview"]').should('be.visible')

    // Click the delete button in the dialog
    cy.get('[data-test="upload-delete-btn"]').should('be.enabled')

    cy.get('[data-test="upload-delete-btn"]').click()
    cy.wait(2000) // Adjust wait time based on your app's image deletion duration

    // Check if the profile was successfully updated after deletion
    cy.get('.q-notification__message').contains('Profile successfully updated')
  })

  // it('should show an error if file size is too large', () => {
  //   // Open the upload dialog by clicking the avatar
  //   cy.get('[data-test="avatar-upload"]').click()

  //   // Ensure the dialog appears
  //   cy.get('[data-test="upload-dialog"]').should('be.visible')

  //   // Choose a large file that exceeds the size limit (5MB)
  //   cy.get('[data-test="upload-file-input"]').selectFile('src/assets/large.jpg')

  //   // Verify the rejection message (this will depend on how the rejection is handled in the code)
  //   cy.get('.q-notification__message').contains('File size is too big. Max file size is 5MB.')
  // })
})
