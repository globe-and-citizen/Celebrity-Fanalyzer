describe('User Navigation', () => {
  it.only('Should display properly and navigate between pages', () => {
    cy.visit('/')
    cy.get('h2').contains('Welcome to Celebrity Fanalyzer!')

    cy.getByData('main-menu').find("a").eq(2).click()
    cy.location("pathname", { timeout: 10000 }).should(
      "eq",
      "/month"
    )
    // cy.get("h2").contains("Entries")

    cy.getByData('main-menu').find("a").eq(1).click()
    cy.location("pathname", { timeout: 10000 }).should(
      "eq",
      "/search"
    )

    cy.getByData('main-menu').find("a").eq(3).click()
    cy.location("pathname", { timeout: 10000 }).should(
      "eq",
      "/profile"
    )
    cy.get("h1").contains("You are not logged in.")
  })
})
