/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests

describe('Commenting', async () => {
  const rand = Math.floor(Math.random() * 1_000)
  let comment = 'Comment ' + rand
  let reply = 'Reply ' + rand

  it('Comment CRUD : Create, like dislike ...', () => {
    cy.viewport('iphone-x')
    cy.login()
    // Visits the prompt of the month
    cy.visit('/month')

    // Programmatically change the q-tab-panel to the comments section
    cy.getByData('panel-3-navigator').click()

    // Wait all comments to be loaded
    cy.getByData('comment-loaded')
    // navigate to the comment input form.
    cy.getByData('comment-main-box').type(comment + '{enter}')

    //Check the form is submitted successfully
    cy.get('.q-notification__message').contains('Comment successfully submitted')

    // Like Comment
    cy.getByData('like' + comment).click()

    // dislike comment
    cy.getByData('dislike' + comment + '').click()
    // })
    //
    // it('Reply comment', () => {
    //   // Visits the prompt of the month
    //   cy.visit('/month')
    //
    //   // Programmatically change the q-tab-panel to the comments section
    //   cy.getByData('panel-3-navigator').click()
    //
    //   // Wait all comments to be loaded
    //   cy.getByData('comment-loaded')
    // expand the add reply form
    cy.getByData(comment + '-add-reply').click()

    // fill add reply form input
    cy.getByData('fill-add-reply').type(reply)

    // submit filled add reply form
    cy.getByData('submit-fill-add-reply').click()

    //Check the form is submitted successfully
    cy.get('.q-notification__message').contains('Reply successfully submitted')

    // Editing reply text

    // Editing reply
    cy.getByData(reply + '-option-button').click()

    cy.getByData('comment-select-edit').click()
    const oldReply = reply
    reply = 'Reply EDITED' + rand

    cy.getByData(oldReply + '-comment-edit')
      .clear()
      .type(reply)

    cy.getByData('submit-edited-comment').click()
    cy.get('.q-notification__message').contains('Comment successfully edited!')

    // deleting comment
    cy.getByData(reply + '-option-button').click()

    cy.getByData('comment-select-delete').click()
    cy.get('.q-notification__message').contains('Comment successfully deleted')
    // })
    //
    // it('Comment Edit & Delete', () => {
    //   // Visits the prompt of the month
    //   cy.visit('/month')
    //
    //   // Programmatically change the q-tab-panel to the comments section
    //   cy.getByData('panel-3-navigator').click()
    //
    //   // Wait all comments to be loaded
    //   cy.getByData('comment-loaded')
    // Editing comment
    cy.getByData(comment + '-option-button').click()

    cy.getByData('comment-select-edit').click()
    const oldComment = comment
    comment = 'Comment EDITED' + rand

    cy.getByData(oldComment + '-comment-edit')
      .clear()
      .type(comment)

    cy.getByData('submit-edited-comment').click()
    cy.get('.q-notification__message').contains('Comment successfully edited!')

    // deleting comment
    cy.getByData(comment + '-option-button').click()

    cy.getByData('comment-select-delete').click()
    cy.get('.q-notification__message').contains('Comment successfully deleted')
  })
})
