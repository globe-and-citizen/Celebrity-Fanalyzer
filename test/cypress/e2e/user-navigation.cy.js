describe('User Navigation', () => {
  it.only('Should display properly and navigate between pages', () => {
    cy.visit('/')
    cy.get('h2').contains('Welcome to Celebrity Fanalyzer!')
    cy.getByData('month-link').find('img', { timeout: 10000 }).should('be.visible')
      .and(($img) => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
    cy.getByData('main-menu').find("a").eq(2).click()
    // cy.wait(30000)
    // cy.location("pathname", { timeout: 30000 }).should(
    //   "eq",
    //   "/month"
    // )
    // cy.get("h2").contains("Entries")

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
})
