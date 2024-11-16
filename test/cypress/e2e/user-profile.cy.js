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

  it('if a user has Prompts & Entries Subscribe,they Should Unsubscribe', () => {
    cy.visit('/profile/subscriptions').wait(2000)

    // Get the Prompts Unsubscribe button and click it
    // cy.get('[data-test="prompt-unsubscribe"] > .q-btn__content').click().wait(1000)

    // Get the Entries Unsubscribe button and click it
    // cy.get('[data-test="entrie-unsubscribe"] > .q-btn__content').click().wait(1000)
  })

  it('Should user Give us feedback', () => {
    cy.visit('/profile/feedback').wait(2000)

    cy.get('[data-test="subject-input"]').type('Great Experience With Celebrity-Fanalyzer Platform').wait(1000)

    cy.get('[data-test="message-input"]')
      .type(
        'Dear Celebrity-Fanalyzer Team,\n\nI wanted to say that Celebrity-Fanalyzer Platform is fantastic! The design is user-friendly, and the features are very engaging. I enjoy using it every day and look forward to more updates.\n\nThank you for your excellent work!\n\nBest regards,\n[Cypress Tester]'
      )
      .wait(1000)

    // Get the submit button and click it
    cy.get('[data-test="submit-button"] > .q-btn__content').click()

    //Check the Feedback submitted!
    cy.get('.q-notification__message').contains('Feedback submitted!')
  })

  it('should delete feedback with the subject "Great Experience With Celebrity-Fanalyzer Platform"', () => {
    cy.visit('/admin/feedbacks').wait(4000)

    const feedbackSubject = 'Great Experience With Celebrity-Fanalyzer Platform'

    // Ensure feedback with subject is visible in the table
    cy.get('[data-test="feedback-table"]').contains(feedbackSubject).should('be.visible')

    // Find the feedback card for the specific subject and click the delete button
    cy.contains(feedbackSubject)
      .closest('[data-test="feedback-card"]') // Locate the card element that contains the feedback subject
      .find('[data-test="trash-button"]') // Find the trash button within the card
      .click() // Click the delete button

    // Ensure the delete confirmation dialog is visible
    cy.get('[data-test="delete-dialog"]').should('be.visible')
    cy.get('[data-test="delete-dialog-message"]').should('contain', `Are you sure you want to delete this feedback from`) // Confirm dialog message contains the expected text

    // Click the delete button in the dialog to confirm deletion
    cy.get('[data-test="delete-button"]').click()

    // Ensure the feedback is removed from the table
    cy.get('[data-test="feedback-table"]').contains(feedbackSubject).should('not.exist') // Feedback should no longer be in the table

    // Verify the success notification appears
    cy.get('.q-notification').should('be.visible').and('contain', 'Feedback deleted successfully')
  })
})
