describe('User Journey', () => {
  it('Should display properly and navigate to month page', () => {
    cy.visit('/')
    cy.get('h2').contains('Welcome to Celebrity Fanalyzer!')
    cy.getByData('month-link').click()

    cy.location("pathname").should(
      "eq",
      "/month"
    )
  })
})
