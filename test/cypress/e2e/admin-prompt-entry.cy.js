/* eslint-disable cypress/unsafe-to-chain-command */
/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

describe('Admin Prompt & Entry', () => {
  let name = 'Hello World!' + Math.random()
  let date = ''
  let visit = '/'
  beforeEach(() => {
    cy.viewport('macbook-16')
    // Visits the profile page
    cy.login()
    cy.visit('/admin')
  })
  it('Try To access non existing prompt page', () => {
    cy.visit('/not-exist-prompt')
    cy.get('.q-notification__message').contains('Not found')
    cy.get('.q-notification__message').contains('You will be redirected in 3 seconds')
    cy.location('pathname').should('eq', '/404')
  })
  it('Try To access non existing Entry page', () => {
    cy.visit('/not-exist-prompt')
    cy.get('.q-notification__message').contains('Not found')
    cy.get('.q-notification__message').contains('You will be redirected in 3 seconds')
    cy.location('pathname').should('eq', '/404')
    cy.get('.q-btn').click()
    cy.location('pathname').should('eq', '/')
  })
  it('Should create a prompt', () => {
    // Get the dropdown button and click it
    cy.get('[data-test="dropdown-menu"]').click()
    // Get the first button (New Prompt) and click it
    cy.get('[data-test="create-prompt"]').should('be.visible').click()
    // Get the date input and choose the last option
    cy.get('[data-test="date-picker"]').should('be.visible').click()
    cy.get('[data-test="close"]').click()
    cy.get('input[data-test="date"]')
      .invoke('val')
      .then((value) => {
        date = value
        visit += value.replace('-', '/')
      })

    // Get the title input and type 'Hello World!' into it
    cy.get('[data-test="input-title"]').type(name)

    // Get the description input and type 'This is a sample prompt' into it
    cy.get('[data-test="input-description"]').type('This is a sample prompt')

    // Get the file image input and upload the Cypress logo
    cy.get('[data-test="file-image"]').selectFile('src/assets/cypress.jpg')

    // Get the categories select and choose add 'Cypress' and 'Test' categories
    cy.get('[data-test="select-categories"]').type('Cypress{enter}').type('Test{enter}')

    // Get the submit button and click it
    cy.get('[data-test="button-submit"] > .q-btn__content').click()
    // cy.get('[data-test="button-submit"]').click()

    //Check the Prompt is submitted successfully
    cy.get('.q-notification__message').contains('Prompt successfully submitted')
  })

  it('Should create a entry', () => {
    // Get the dropdown button and click it
    cy.get('[data-test="dropdown-menu"]').click()

    // Get the first button (New Entry) and click it
    cy.get('[data-test="create-entry"]').should('be.visible').click()

    // Get the prompt select and choose the "Hello World!" option
    cy.get('[data-test="select-prompt"]').wait(4000).select(name)

    // Get the title input and type 'Hello World!' into it
    cy.get('[data-test="input-title"]').type('entry ' + name)

    // Get the description input and type 'This is a sample entry' into it
    cy.get('[data-test="input-description"]').type('This is a sample entry')

    // Get the file image input and upload the Cypress logo
    cy.get('[data-test="file-image"]').selectFile('src/assets/cypress.jpg')

    // Get the submit button and click it
    cy.get('[data-test="button-submit"]').click()

    // Check the Entry is submitted successfully
    cy.get('.q-notification__message').contains('Entry successfully submitted')
  })

  it('Should Navigate  in prompt and entry', () => {
    cy.visit(visit)
    cy.contains(name)
    cy.get('[data-test="like-button"]').click()
    cy.get('[data-test="like-button"]').click()
    cy.get('[data-test="entry"]').eq(0).find('[data-test="item-link"]').click()
    cy.get('[data-test="entry-page"]').eq(0).click()
    cy.get('[data-test="like-button"]').click()
    cy.get('[data-test="like-button"]').click()
  })

  it('Should display the prompt and interact', () => {
    // cy.visit('/hello-world-')
    cy.visit(visit)
    cy.contains(name)
    cy.scrollTo('bottom')
    cy.get('[data-test="entries"]')
    cy.scrollTo('top')
    const likedIcon = '/icons/thumbs-up-bolder.svg'
    const likeIcon = '/icons/thumbs-up.svg'
    const dislikedIcon = '/icons/thumbs-down-bolder.svg'
    const dislikeIcon = '/icons/thumbs-down.svg'
    cy.get('[data-test="like-button"]')
      .find('img')
      .then(($img) => {
        /**
         * Like if isLiked
         */
        if ($img.attr('src') === likedIcon) {
          cy.get('[data-test="like-button"]').click()
        }
        cy.get('[data-test="like-button"]').find('img').should('have.attr', 'src').should('include', likeIcon)
      })
    cy.get('[data-test="dislike-button"]')
      .find('img')
      .then(($img) => {
        /**
         * Dislike if isDisliked
         */
        if ($img.attr('src') === dislikedIcon) {
          cy.get('[data-test="dislike-button"]').click()
        }
        cy.get('[data-test="dislike-button"]').find('img').should('have.attr', 'src').should('include', dislikeIcon)
      })

    // Like then Like Aigain
    cy.get('[data-test="like-button"]').click()
    cy.get('[data-test="like-button"]').find('img').should('have.attr', 'src').should('include', likedIcon)
    cy.get('[data-test="like-button"]').click()
    cy.get('[data-test="like-button"]').find('img').should('have.attr', 'src').should('include', likeIcon)

    // Dislike then Dislike Aigain
    cy.get('[data-test="dislike-button"]').click()
    cy.get('[data-test="dislike-button"]').find('img').should('have.attr', 'src').should('include', dislikedIcon)
    cy.get('[data-test="dislike-button"]').click()
    cy.get('[data-test="dislike-button"]').find('img').should('have.attr', 'src').should('include', dislikeIcon)

    // Dislike Then Like
    cy.get('[data-test="dislike-button"]').click()
    cy.get('[data-test="dislike-button"]').find('img').should('have.attr', 'src').should('include', dislikedIcon)
    cy.get('[data-test="like-button"]').click()
    cy.get('[data-test="like-button"]').find('img').should('have.attr', 'src').should('include', likedIcon)
    cy.get('[data-test="dislike-button"]').find('img').should('have.attr', 'src').should('include', dislikeIcon)

    // Dislike A liked prompt
    cy.get('[data-test="dislike-button"]').click()
    cy.get('[data-test="dislike-button"]').find('img').should('have.attr', 'src').should('include', dislikedIcon)

    // Dislike To have a not liked & not disliked prompt
    cy.get('[data-test="dislike-button"]').click()
    cy.get('[data-test="dislike-button"]').find('img').should('have.attr', 'src').should('include', dislikeIcon)
  })

  it('Should edit the prompt', () => {
    // Get the second button (Delete Prompt) and click it
    cy.get('[data-test="input-search"]').type('Cypress Tester').wait(2000)

    // Get the edit button and click it
    cy.get(`[data-test="${date}"] > .text-right > [data-test="button-edit"]`).click()

    cy.get('[data-test="input-title"]').type(name)

    // Get the description input and type 'This is a sample prompt' into it
    cy.get('[data-test="input-description"]').type('This is a sample prompt')

    // Get the file image input and upload the Cypress logo
    cy.get('[data-test="file-image"]').selectFile('src/assets/cypress.jpg')

    // Get the categories select and choose add 'Cypress' and 'Test' categories
    cy.get('[data-test="select-categories"]').type('Cypress{enter}').type('Test{enter}')

    // Get the submit button and click it
    cy.get('[data-test="button-submit"] > .q-btn__content').click()
    // cy.get('[data-test="button-submit"]').click()

    //Check the Prompt is edited successfully
    cy.get('.q-notification__message').contains('Prompt successfully edited')
  })

  it('Should edit a entry', () => {
    // cy.visit(visit)
    // cy.contains(name)
    // cy.scrollTo('bottom')
    // cy.get('entry ' + name).click()

    // cy.scrollTo('bottom')
    cy.get('[data-test="input-search"]').type('Cypress Tester')
    cy.get(`[data-test="${date}"] > .q-table--col-auto-width > [data-test="button-expand"]`).click().wait(2000)
    cy.get('data-test="button-edit-entry"').click()

    // Get the edit button and click it

    // Get the description input and type 'This is a sample entry' into it
    cy.get('[data-test="input-description"]').type('This is a Updated entry')

    // Get the file image input and upload the Cypress logo
    // cy.get('[data-test="file-image"]').selectFile('src/assets/cypress.jpg')

    // Get the submit button and click it
    cy.get('[data-test="button-submit"]').click({ force: true })

    // Check the Entry is edited successfully
    cy.get('.q-notification__message').contains('Entry successfully edited')
  })

  it('Should delete the entry', () => {
    // Get the second button (Delete Entry) and click it
    cy.get('[data-test="input-search"]').type('tester')
    // Get the expand button and click it
    cy.get(`[data-test="${date}"] > .q-table--col-auto-width > [data-test="button-expand"]`).click()
    // Delete all entry in a prompt and left one
    cy.get('[data-test="button-delete-entry"]').then(($btn) => {
      for (let i = $btn.length - 1; i > 0; i--) {
        cy.get('[data-test="button-delete-entry"]').eq(i).click({ force: true })
        cy.get('[data-test="confirm-delete-entry"]').click()
        // Wait the notification
        cy.get('.q-notification__message').contains('Entry deleted')
        cy.wait(4000)
      }
    })
    cy.wait(4000)

    // Delete the last one
    cy.get('[data-test="button-delete-entry"]').eq(0).click({ force: true })
    cy.get('[data-test="confirm-delete-entry"]').click()
    // Wait the notification
    cy.get('.q-notification__message').contains('Entry deleted')
  })

  it('Should delete the prompt', () => {
    // Get the second button (Delete Prompt) and click it
    cy.get('[data-test="input-search"]').type('Cypress Tester').wait(2000)

    // Get the delete button and click it
    cy.get(`[data-test="${date}"] > .text-right > [data-test="button-delete-prompt"]`).click()

    // Get the confirm button and click it
    cy.get('[data-test="confirm-delete-prompt"]').click().wait(2000)
    // Wait the notification
    cy.get('.q-notification__message').contains('Prompt successfully deleted')
  })
})
