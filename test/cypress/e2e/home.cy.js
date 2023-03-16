/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

// ** This file is an example of how to write Cypress tests, you can safely delete it **

// This test will pass when run against a clean Quasar project
describe('Home page', () => {
  context("Roadmap Section", ()=>{
    it('Testing accordion', () => {
      cy.viewport(1280, 800)
      cy.visit('/')
      cy.get('h3').should('have.length', 4)
      cy.get('h3').eq(0).contains('“Celebrity Fanalyzer?”')
      cy.getByData('roadmap').find("h3").contains('Development Roadmap')

      cy.getByData('roadmap').get(".q-expansion-item").eq(0).click()
    })
  })
  it('Should display properly', () => {
    cy.visit('/')
    cy.get('h2').contains('Welcome to Celebrity Fanalyzer!')
    // cy.get('h3').should('have.length', 3)
    cy.get('h3').eq(0).contains('“Celebrity Fanalyzer?”')
    cy.get('[data-test="roadmap"]').find("h3").contains('Development Roadmap')
  })
})

// ** The following code is an example to show you how to write some tests for your home page **
//
// describe('Home page tests', () => {
//   beforeEach(() => {
//     cy.visit('/');
//   });
//   it('has pretty background', () => {
//     cy.dataCy('landing-wrapper')
//       .should('have.css', 'background').and('match', /(".+(\/img\/background).+\.png)/);
//   });
//   it('has pretty logo', () => {
//     cy.dataCy('landing-wrapper img')
//       .should('have.class', 'logo-main')
//       .and('have.attr', 'src')
//       .and('match', /^(data:image\/svg\+xml).+/);
//   });
//   it('has very important information', () => {
//     cy.dataCy('instruction-wrapper')
//       .should('contain', 'SETUP INSTRUCTIONS')
//       .and('contain', 'Configure Authentication')
//       .and('contain', 'Database Configuration and CRUD operations')
//       .and('contain', 'Continuous Integration & Continuous Deployment CI/CD');
//   });
// });
