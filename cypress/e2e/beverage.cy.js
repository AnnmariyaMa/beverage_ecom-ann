describe('Beverage Ecommerce', () => { 
  let baseUrl; 
 
  before(() => {
    cy.task('startServer').then((url) => {
      baseUrl = `${url}/search_beverage.html`; 
      cy.visit(baseUrl); 
    });
  }); 
    afterEach(() => {
      cy.task('stopServer'); // Stop the server
    });
  
    it('should display popular searches on load', () => {
      cy.visit(baseUrl);

      // Ensure popular searches are visible
      cy.get('#popularSearches').should('be.visible');
      cy.get('.keyword').should('have.length.greaterThan', 0);
      cy.get('#searchInput').should('be.visible');

      
    });
    it('should clear the search input and display popular searches', () => {
      cy.visit(baseUrl);
    
      cy.get('#searchInput').type('Mojito');
      cy.get('#searchInput').clear();
      
      // Verify that results are cleared
      cy.get('#resultsContainer').should('be.empty');
      
      // Verify popular searches are displayed again
      cy.get('#popularSearches').should('be.visible');
    });
    it('should display a message when no results are found', () => {
      cy.visit(baseUrl);
    
      cy.get('#searchInput').type('NonExistentItem{enter}');
      cy.get('#resultsContainer').should('contain', 'No beverages found!');
    });
    it('should return correct results for a specific search term', () => {
      cy.visit(baseUrl);
    
      cy.get('#searchInput').type('Mojito{enter}');
      
      // Verify that the results contain the searched beverage
      cy.get('#resultsContainer').should('contain', 'Mojito');
    });
    it('should sort results by price (low to high)', () => {
      cy.visit(baseUrl);
    
      cy.get('#searchInput').type('coke{enter}');
      
      cy.get('#sortDropdown').select('low-to-high');
      
      // Verify that results are sorted in ascending order of price
      cy.get('.beverage-item').then(items => {
        const prices = Array.from(items).map(item => 
          parseFloat(item.querySelector('p:nth-child(5)').textContent.replace('$', ''))
        );
        expect(prices).to.deep.equal([...prices].sort((a, b) => a - b));
      });
    });
    it('should display an error message on API failure', () => {
      cy.intercept('GET', '/search-beverage?*', { statusCode: 500 }).as('searchFail');
      cy.visit(baseUrl);
    
      cy.get('#searchInput').type('coke{enter}');
      cy.wait('@searchFail');
      
      // Verify error message
      cy.get('#resultsContainer').should('contain', 'Error occurred. Please try again.');
    });
    it('should load images for the search results', () => {
      cy.visit(baseUrl);
    
      cy.get('#searchInput').type('coke{enter}');
      
      cy.get('.beverage-item img').should('be.visible').and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0); // Ensures image has loaded
      });
    });
    it('should navigate back when back button is clicked', () => {
      cy.visit(baseUrl);
      
      cy.get('.back-button').click();
      
      // Verify navigation
      cy.url().should('not.include', 'search_beverage.html');
    });
    
    
    
     
  });
  