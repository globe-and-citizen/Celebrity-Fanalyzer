/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />

describe('TheAnthrogram Graph Visibility', () => {
  beforeEach(() => {
    cy.viewport('macbook-16')
    // Replace with your app's base URL or the route to the page containing TheAnthrogram.vue
    cy.visit('/month').wait(1000)
    // cy.get('[data-test="like-button"]').click().wait(1000)

    // Selects the second card on the page and clicks it
    cy.get('[data-test="graph-tab"]').click({ force: true })
    cy.on('uncaught:exception', (err, runnable) => {
      // Returning false here prevents Cypress from
      // failing the test when ResizeObserver errors occur
      if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        return false
      }
    })
  })

  it('should display the header with the correct title', () => {
    cy.get('header').contains('Anthrogram').should('be.visible')
  })

  it('should render the VisitorsBar graph if visitor data is available', () => {
    cy.get('[data-test="visitors-bar"]').should('be.visible')
  })

  it('should render the HalfDonought graph if stats data is available', () => {
    cy.get('[data-test="half-donought"]').should('be.visible')
  })

  it('should conditionally render the CTRBar if isAdd is true', () => {
    cy.window().then((win) => {
      const isAdd = win.__vue_app__?.config?.globalProperties?.isAdd || false
      if (isAdd) {
        cy.get('[data-test="ctr-bar"]').should('be.visible')
      } else {
        cy.get('[data-test="ctr-bar"]').should('not.exist')
      }
    })
  })

  it('should render the SharesPie graph if shares data is available', () => {
    cy.get('[data-test="shares-pie"]').should('be.visible')
  })

  it('should conditionally render the LikesBar graph if likes or dislikes data is available', () => {
    cy.window().then((win) => {
      const hasLikesOrDislikes =
        (win.__vue_app__?.config?.globalProperties?.likeStore?.getLikes?.length || 0) > 0 ||
        (win.__vue_app__?.config?.globalProperties?.likeStore?.getDislikes?.length || 0) > 0
      const hasSharesStats = (win.__vue_app__?.config?.globalProperties?.shareStore?.getSharesStats?.length || 0) > 0

      if (hasLikesOrDislikes) {
        cy.get('[data-test="likes-bar"]').should('be.visible')

        if (hasSharesStats) {
          cy.get('[data-test="likes-bar"]').should('have.class', 'col-md-6')
        } else {
          cy.get('[data-test="likes-bar"]').should('have.class', 'col-md-12')
        }
      } else {
        cy.get('[data-test="likes-bar"]').should('not.exist')
      }
    })
  })
  it('should render the PopularityGauge for article popularity if article rating is available', () => {
    cy.get('[data-test="article-popularity"]').should('be.visible')
  })

  it('should render the PopularityGauge for user popularity if user rating is available', () => {
    cy.get('[data-test="user-popularity"]').should('be.visible')
  })

  it('should render the LeafletMap if interaction data by country is available', () => {
    cy.get('[data-test="leaflet-map"]').should('be.visible')
    // Verify the map is visible
    cy.get('#map').should('be.visible')

    // Change filter and validate updates
    cy.get('[data-test="filter-select"]').click().first().click()

    cy.get('[data-test="filter-select"]')
      .invoke('val')
      .then((selectedValue) => {
        // Verify the total countries text matches the selected filter option
        cy.get('.total-countries').should('contain.text', selectedValue)
      })

    cy.get('#map').should('exist') // Ensure map remains visible and functional
  })

  it('should correctly toggle tabs and display the respective data', () => {
    cy.get('[data-test="visitors-bar"]').should('be.visible')
    cy.get('[data-test="q-tab-weekly"]').click()
    cy.get('[data-test="visitors-bar"]').should('be.visible')
    cy.get('[data-test="q-tab-monthly"]').click()
    cy.get('[data-test="visitors-bar"]').should('be.visible')
  })
})
