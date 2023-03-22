/* eslint-disable cypress/no-unnecessary-waiting */
describe('Sharing a Prompt', () => {
  it('Should display properly and navigate to /month page', () => {
    cy.visit('/month').wait(5000)

    cy.get('.q-btn').eq(3).scrollIntoView().click()

    cy.get('.q-card > .row > :nth-child(1) > img').click().wait(2000)

    cy.get(':nth-child(7) > .q-btn__content > .block').scrollIntoView().invoke('text').then(parseFloat).should('be.greaterThan', 0)

    cy.get('.q-btn').eq(3).scrollIntoView().click()

    cy.get('.q-card > .row > :nth-child(2) > img').click().wait(2000)

    cy.get(':nth-child(7) > .q-btn__content > .block').scrollIntoView().invoke('text').then(parseFloat).should('be.greaterThan', 1)

    cy.get('[style="padding-bottom: 64px;"] > .q-tabs > .q-tabs__content > .q-tab--inactive').click()

    cy.get('canvas').eq(1).scrollIntoView().should('be.visible')
  })
})
