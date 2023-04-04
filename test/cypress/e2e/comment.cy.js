/// <reference types="cypress" />

// Use `cy.dataCy` custom command for more robust tests

describe('Commenting', async () => {
  // const store = useCommentStore()

  it('will comment ', () => {
    // default to iphone as "mobile first" should be our montra
    cy.viewport('iphone-x')

    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })

    // programmatically change the q-tab-panel to the comments section.
    cy.get('[data-test="panel-3-navigator"]').click()

    // hack to let all the loading happen

    // navigate to the comment input form.

    cy.get('[data-test="comment-entry-box"]').type('one, two three')

    cy.wait(5000) // wait 5 seconds always.
    cy.get(':nth-child(20) > :nth-child(1)', { timeout: 100000 }) // give only as much time as necessary, no more, up to 100000

    //If you click too early, there is error -- so you need to wait.
    cy.get('[data-test="submit-comment"]').click()

    // console.log(store.isLoading())

    // push enter to submit
    //cy.get('[data-test="submit-comment"]').click({ timeout: 1000 }) //.wait(2000)
    // })
  })
})
