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
    cy.get('.keyword').should('have.length.greaterThan', 0); // Assuming `.keyword` represents search suggestions
    cy.get('#searchInput').should('be.visible');
  });

  it('should clear the search input and display popular searches', () => {
    cy.visit(baseUrl);

    cy.get('#searchInput').type('Coke');
    cy.get('#searchInput').clear();
    cy.wait(500);

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
    cy.intercept('GET', '/search-beverage*', {
      statusCode: 200,
      body: [
        {
          name: 'Coke',
          image: '/images/coke.jpg',
          category: 'Soft Drink',
          description: 'A popular fizzy drink',
          price: 1.99,
          rating: 4.5,
          quantity: 20,
        },
      ],
    }).as('searchCoke');
    cy.visit(baseUrl);

    cy.get('#searchInput').type('Coke{enter}');
    cy.wait('@searchCoke');

    // Verify that the results contain the searched beverage
    cy.get('#resultsContainer').should('contain', 'Coke');
  });

  it('should sort results by price (low to high)', () => {
    cy.intercept('GET', '/search-beverage*', {
      statusCode: 200,
      body: [
        { name: 'Coke', price: 1.99 },
        { name: 'Pepsi', price: 2.99 },
        { name: 'Sprite', price: 0.99 },
      ],
    }).as('searchCoke');
    cy.visit(baseUrl);

    cy.get('#searchInput').type('Coke{enter}');
    cy.wait('@searchCoke');

    cy.get('#sortDropdown').select('low-to-high');

    // Verify that results are sorted in ascending order of price
    cy.get('.beverage-item').then((items) => {
      const prices = Array.from(items).map((item) =>
        parseFloat(item.querySelector('p:nth-child(5)').textContent.replace('$', ''))
      );
      expect(prices).to.deep.equal([...prices].sort((a, b) => a - b));
    });
  });

  it('should sort results by price (high to low)', () => {
    cy.intercept('GET', '/search-beverage*', {
      statusCode: 200,
      body: [
        { name: 'Coke', price: 1.99 },
        { name: 'Pepsi', price: 2.99 },
        { name: 'Sprite', price: 0.99 },
      ],
    }).as('searchCoke');
    cy.visit(baseUrl);

    cy.get('#searchInput').type('Coke{enter}');
    cy.wait('@searchCoke');

    cy.get('#sortDropdown').select('high-to-low');

    // Verify that results are sorted in descending order of price
    cy.get('.beverage-item').then((items) => {
      const prices = Array.from(items).map((item) =>
        parseFloat(item.querySelector('p:nth-child(5)').textContent.replace('$', ''))
      );
      expect(prices).to.deep.equal([...prices].sort((a, b) => b - a));
    });
  });

  
  
});
