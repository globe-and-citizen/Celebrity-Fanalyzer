/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />

describe('TheAnthrogram Graph Visibility', () => {
  beforeEach(() => {
    cy.viewport('macbook-16')
    cy.visit('/month').wait(1000)

    cy.get('[data-test="graph-tab"]').click({ force: true })

    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        return false
      }
    })
  })

  it('should display the header with the correct title', () => {
    cy.get('header').contains('Anthrogram').should('be.visible')
  })

  // it('should render the VisitorsBar graph if visitor data is available', () => {
  //   cy.get('[data-test="visitors-bar"]').should('be.visible')
  // })

  it('should render the VisitorsBar graph if visitor data is available', () => {
    cy.window().then((win) => {
      const hasVisitors = win.__vue_app__?.config?.globalProperties?.visitorStore?.getVisitors?.length > 0
      const hasStats = !!win.__vue_app__?.config?.globalProperties?.statStore?.getStats
      const hasValidStats = hasStats

      if (hasVisitors) {
        cy.get('[data-test="visitors-bar"]').should('be.visible')

        // Check class based on statStore conditions
        if (hasValidStats) {
          cy.get('[data-test="visitors-bar"]').should('have.class', 'col-md-6')
        } else {
          cy.get('[data-test="visitors-bar"]').should('have.class', 'col-md-12')
        }
      } else {
        cy.get('[data-test="visitors-bar"]').should('not.exist')
      }
    })
  })

  it('should render the HalfDonought graph if stats data is available', () => {
    cy.window().then((win) => {
      const hasStats = win.__vue_app__?.config?.globalProperties?.statStore?.getStats?.length > 0

      if (hasStats) {
        cy.get('[data-test="half-donought"]').should('be.visible')
      } else {
        cy.get('[data-test="half-donought"]').should('not.exist')
      }
    })
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

  // it('should render the SharesPie graph if shares data is available', () => {
  //   cy.get('[data-test="shares-pie"]').should('be.visible')
  // })

  it('should render the SharesPie graph if shares data is available', () => {
    cy.window().then((win) => {
      const hasShares = win.__vue_app__?.config?.globalProperties?.shareStore?.getSharesStats?.length > 0
      const hasLikesOrDislikes =
        !!win.__vue_app__?.config?.globalProperties?.likeStore?.getLikes?.length ||
        !!win.__vue_app__?.config?.globalProperties?.likeStore?.getDislikes?.length

      if (hasShares) {
        cy.get('[data-test="shares-pie"]').should('be.visible')

        // Verify dynamic class assignment
        if (hasLikesOrDislikes) {
          cy.get('[data-test="shares-pie"]').should('have.class', 'col-md-6')
        } else {
          cy.get('[data-test="shares-pie"]').should('have.class', 'col-md-12')
        }
      } else {
        cy.get('[data-test="shares-pie"]').should('not.exist')
      }
    })
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
    cy.window().then((win) => {
      const hasArticleRating = !!win.__vue_app__?.config?.globalProperties?.statStore?.getArticleRate

      if (hasArticleRating) {
        cy.get('[data-test="article-popularity"]').should('be.visible')
      } else {
        cy.get('[data-test="article-popularity"]').should('not.exist')
      }
    })
  })

  it('should render the PopularityGauge for user popularity if user rating is available', () => {
    cy.window().then((win) => {
      const hasUserRating = !!win.__vue_app__?.config?.globalProperties?.statStore?.getUserRate

      if (hasUserRating) {
        cy.get('[data-test="user-popularity"]').should('be.visible')
      } else {
        cy.get('[data-test="user-popularity"]').should('not.exist')
      }
    })
  })

  it('should render the LeafletMap if interaction data by country is available', () => {
    cy.window().then((win) => {
      const hasInteractionData = !!win.__vue_app__?.config?.globalProperties?.statStore?.getAllInteractionsByCountry?.response?.length

      if (hasInteractionData) {
        cy.get('[data-test="leaflet-map"]').should('be.visible')
        cy.get('#map').should('be.visible')

        cy.get('[data-test="filter-select"]').click()
        cy.get('[data-test="filter-select"]').first().click()

        cy.get('[data-test="filter-select"]')
          .invoke('val')
          .then((selectedValue) => {
            cy.get('.total-countries').should('contain.text', selectedValue)
          })

        cy.get('#map').should('exist')
      } else {
        cy.get('[data-test="leaflet-map"]').should('not.exist')
      }
    })
  })

  it('should correctly toggle tabs and display the respective data', () => {
    cy.window().then((win) => {
      const hasVisitorsData = !!win.__vue_app__?.config?.globalProperties?.visitorStore?.getVisitors?.length

      if (hasVisitorsData) {
        cy.get('[data-test="visitors-bar"]').should('exist').and('be.visible')

        cy.get('[data-test="q-tab-weekly"]').click()
        cy.get('[data-test="visitors-bar"]').should('exist').and('be.visible')

        cy.get('[data-test="q-tab-monthly"]').click()
        cy.get('[data-test="visitors-bar"]').should('exist').and('be.visible')
      } else {
        cy.get('[data-test="visitors-bar"]').should('not.exist')
      }
    })
  })
})
