describe('User Navigation', () => {
  beforeEach(function () {
    cy.viewport('iphone-x')
    cy.visit('/')

    cy.get('h2').contains('Welcome to Celebrity Fanalyzer!')

    // Create alias @month-link
    cy.getByData('month-link').find('img', {timeout: 10000}).should('be.visible')
      .and(($img) => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      }).as("month-link")
  })
  it('Should display properly and navigate between pages', () => {
    cy.getByData('main-menu').find("a").eq(1).click()
    cy.location("pathname").should(
      "eq",
      "/search"
    )

    cy.getByData('main-menu').find("a").eq(3).click()
    cy.location("pathname").should(
      "eq",
      "/profile"
    )
    cy.get("h1").contains("You are not logged in.")
  })

  context("UnAuthenticated user", function () {
    it("Should Be able to navigate to month page, like and dislike a prompt", function () {
      cy.get("@month-link").click()
      cy.location("pathname").should(
        "eq",
        "/month"
      )

      cy.getByData('like-button').should('have.attr', 'disabled');
      // Wait for the button to be disabled
      cy.get("button.q-btn.q-btn-item.non-selectable.no-outline.q-btn--flat.q-btn--rectangle.q-btn--rounded.text-red.q-btn--actionable.q-focusable.q-hoverable")


      cy.getByData('like-button').should('not.have.attr', 'disabled');
      cy.getByData('dislike-button').should('not.have.attr', 'disabled');

      // Get Like count
      cy.getByData('like-button').find('span.block').invoke('text').as('initialCount');


      // Like
      cy.getByData('like-button').click();

      // Check Like count update
      cy.getByData('like-button').find('span.block').invoke('text').should('not.equal', this.initialCount);

      // Get Dislike count
      cy.getByData('dislike-button').find('span.block').invoke('text').as('dislikeInitialCount');

      // Dislike
      cy.getByData('dislike-button').click();

      // Check Dislike count update
      cy.getByData('dislike-button').find('span.block').invoke('text').should('not.equal', this.dislikeInitialCount);


    })
  })

})
