/// <reference types="cypress" />

// Use `cy.dataCy` custom command for more robust tests

describe('Commenting', async () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    // Visits the profile page
    cy.visit('/profile')

    // Get the login button and click it
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('.q-page > .q-btn').click()

    // Visits the admin page and wait for 15 seconds
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="main-menu"]').find('a').eq(4).click()
    cy.location('pathname').should('eq', '/admin')
  })
  // const store = useCommentStore()

  it('creating comment ', () => {
    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs')
    // programmatically change the q-tab-panel to the comments section.
    cy.get('[data-test="panel-3-navigator"]').click()

    //Will wait all comment will be loaded
    cy.get('[data-test="comment-loaded"]')

    // navigate to the comment input form.
    cy.get('[data-test="comment-entry-box"]').type('Javokhir-testing')

    // Submit the form
    cy.get('[data-test="submit-comment"]').click()

    //Check the form is submitted successfully
    cy.get('.q-notification__message').contains('Comment successfully submitted')
  })

  it('like comment', () => {
    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs')

    // programmatically change the q-tab-panel to the comments section.
    cy.get('[data-test="panel-3-navigator"]').click()


    //Will wait all comment will be loaded
    cy.get('[data-test="comment-loaded"]')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing"]').click().wait(5000)
  })

  it('dislike comment', () => {
    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs')

    //programmatically change the q-tab-panel to the comments section.
    cy.get('[data-test="panel-3-navigator"]').click()

    //Will wait all comment will be loaded
    cy.get('[data-test="comment-loaded"]')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="dislikeJavokhir-testing"]').click().wait(5000)
  })

  it('add reply comment', () => {
    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs')

    //programmatically change the q-tab-panel to the comments section.
    cy.get('[data-test="panel-3-navigator"]').click()

    //Will wait all comment will be loaded
    cy.get('[data-test="comment-loaded"]')

    // expand the add reply form
    cy.get('[data-test="Javokhir-testing-add-reply"]').click()

    // fill add reply form input
    cy.get('[data-test="Javokhir-testing-fill-add-reply"]').type('Added-Reply')

    // submit filled add reply form
    cy.get('[data-test="Javokhir-testing-submit-fill-add-reply"]').click()

    //Check the form is submitted successfully
    cy.get('.q-notification__message').contains('Reply successfully submitted')

  })

  it('editing reply text', () => {
    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs')

    //programmatically change the q-tab-panel to the comments section.
    cy.get('[data-test="panel-3-navigator"]').click()

    //Will wait all comment will be loaded
    cy.get('[data-test="comment-loaded"]')

    // expand the add reply form
    cy.get('[data-test="Javokhir-testing-add-reply"]').click()

    cy.get('[data-test="Added-Reply-open-reply-edit-delete"]').click({ multiple: true, force: true })

    cy.get('[data-test="Added-Reply-open-reply-edit"]').click({ multiple: true, force: true })

    cy.get('[data-test="Added-ReplyfillEditReply"]').eq(0).type('Edited-Reply', { force: true })

    cy.get('[data-test="Added-ReplyEdited-Reply-submit-reply-edit"]').eq(0).click({ multiple: true, force: true })

    //Check the form is submitted successfully
    cy.get('.q-notification__message').contains('Comment successfully edited!')
  })

  it('deleting reply text', () => {
    cy.visit('/2023/02/more-frogs')

    cy.get('[data-test="panel-3-navigator"]').click()

    //Will wait all comment will be loaded
    cy.get('[data-test="comment-loaded"]')

    cy.get('[data-test="Javokhir-testing-add-reply"]').click()

    cy.get('[data-test="Added-ReplyEdited-Reply-open-reply-edit-delete"]').eq(0).click({ multiple: true, force: true })

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Added-ReplyEdited-Reply-open-reply-delete"]').click()
  })

  it('editing comment', () => {
    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs')

    //programmatically change the q-tab-panel to the comments section.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click()

    //Will wait all comment will be loaded
    cy.get('[data-test="comment-loaded"]')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing-button-dropdown"]').click()

    cy.get('[data-test="comment-select-edit"]').click()

    cy.get('[data-test="Javokhir-testing-comment-edit"]').type('-EDITED')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="submit-edited-comment"]').click().wait(5000)
  })

  it('deleting comment', () => {
    cy.visit('/2023/02/more-frogs')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click()

    //Will wait all comment will be loaded
    cy.get('[data-test="comment-loaded"]')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing-EDITED-button-dropdown"]').click()

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test = "comment-select-delete"]').click().wait(5000)
  })
})
