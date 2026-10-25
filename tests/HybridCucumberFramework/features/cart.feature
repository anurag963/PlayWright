@cart
Feature: Cart across API and UI
  As a shopper
  I want the cart to be the same whether it is changed in the browser or over HTTP
  So that what I see is what I will buy

  @HY1 @smoke
  Scenario: Products added via the API appear in the UI cart
    Given I have the list of all products from the API
    When I add the product at position 1 to the cart via the API with quantity 3
    And I add the product at position 2 to the cart via the API
    And I open the cart page in the UI
    Then the UI cart shows exactly the added products with API names, prices and totals

  @HY2
  Scenario: A product added in the UI is in the API cart
    Given I am on the home page
    When I click "Products" in the header
    And I add the product at position 1 to the cart in the UI
    Then the API cart contains exactly the added products

  @HY3
  Scenario: A product removed in the UI is gone from the API cart
    When I add product 1 to the cart via the API
    And I add product 2 to the cart via the API
    And I open the cart page in the UI
    And I remove product 1 from the cart in the UI
    Then the API cart contains exactly the added products

  @HY4
  Scenario: Quantity set on the product page is the quantity in the API cart
    When I add product 1 to the cart from its details page in the UI with quantity 4
    Then the API cart contains exactly the added products

  @HY5
  Scenario: A guest cart built via the API is kept after logging in on the UI
    Given a registered user exists
    When I search the API for "Jeans"
    And I add every product found to the cart via the API
    And I log in through the UI
    Then I am logged in as the user
    When I open the cart page in the UI
    Then the UI cart lists the added products
