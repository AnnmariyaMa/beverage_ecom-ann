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

  // Test: Should clear the search input and display popular searches
  it('should clear the search input and display popular searches', () => {
    cy.visit(baseUrl);

    cy.get('#searchInput').type('Coke', {force: true});
    cy.get('#searchInput').clear();
    cy.wait(5000);

    // Verify that results are cleared
    cy.get('#resultsContainer').should('be.empty');

    // Verify popular searches are displayed again
    cy.get('#popularSearches').should('be.visible');
  });

  // Test: Should handle empty search input gracefully
  it('should handle empty search input gracefully', () => {
    cy.visit(baseUrl);

    cy.get('#searchInput').clear();
    cy.get('#searchInput').type('{enter}');
    cy.get('#resultsContainer').should('be.empty');
    cy.get('#popularSearches').should('be.visible');
  });

  // Test: Should handle invalid characters in search input
  it('should handle invalid characters in search input', () => {
    cy.visit(baseUrl);

    cy.get('#searchInput').type('!@#$%^&*(){enter}');
    cy.get('#resultsContainer').should('contain', 'No beverages found!');
  });

  // Test: Should display popular searches on load
  it('should display popular searches on load', () => {
    cy.visit(baseUrl);

    // Ensure popular searches are visible
    cy.get('#popularSearches').should('be.visible');
    cy.get('.keyword').should('have.length.greaterThan', 0); // Assuming `.keyword` represents search suggestions
    cy.get('#searchInput').should('be.visible');
  });

  // Test: Should display a message when no results are found
  it('should display a message when no results are found', () => {
    cy.visit(baseUrl);

    cy.get('#searchInput').type('NonExistentItem{enter}');
    cy.get('#resultsContainer').should('contain', 'No beverages found!');
  });

  // Test: Should return correct results for a specific search term
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

  // Test: Should sort results by price (low to high)
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

  // Test: Should sort results by price (high to low)
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

  // Test: Should call searchbeverage function on enter key press
  

  // Test: Should display search results correctly
  it('should display search results correctly', () => {
    cy.visit(baseUrl);

    // Intercept the search API call and return mock data
    cy.intercept('GET', '/search-beverage*', {
      statusCode: 200,
      body: [
        { name: 'Coke', image: '/images/coke.jpg', category: 'Soft Drink', description: 'A popular fizzy drink', price: 1.99, rating: 4.5, quantity: 20 }
      ]
    }).as('searchCoke');

    cy.get('#searchInput').type('Coke{enter}');
    cy.wait('@searchCoke');

    // Ensure that the result container is populated
    cy.get('#resultsContainer').should('contain', 'Coke');
    cy.get('.beverage-item').should('have.length', 1); // Expecting one result
  });

  // Test: Should set search query and trigger searchbeverage function
  
  // Test: Should handle empty results gracefully
  it('should handle empty results gracefully', () => {
    cy.visit(baseUrl);

    // Intercept the search API call and return empty data
    cy.intercept('GET', '/search-beverage*', {
      statusCode: 200,
      body: []
    }).as('searchCoke');

    cy.get('#searchInput').type('NonExistentItem{enter}');
    cy.wait('@searchCoke');

    // Verify that the no results message is displayed
    cy.get('#resultsContainer').should('contain', 'No beverages found!');
  });
});
