@cart
Feature: Cart API
  As a shopper's client
  I want to add, review and remove products in the cart
  So that the cart always shows what will be bought

  @TC12 @smoke
  Scenario: Add products to the cart
    Given I have the list of all products
    When I add the product at position 1 to the cart
    Then the cart replies "Added To Cart"
    When I add the product at position 2 to the cart
    And I open the cart
    Then the cart contains exactly the added products
    And each cart row has the listed name, price and category
    And each cart row total is price times quantity

  @TC13
  Scenario: Product quantity is kept in the cart
    When I add product 1 to the cart with quantity 4
    And I open the cart
    Then the cart contains exactly the added products
    And product 1 is in the cart with quantity 4
    And each cart row total is price times quantity

  @TC13
  Scenario: Adding the same product again increases its quantity
    When I add product 1 to the cart with quantity 2
    And I add product 1 to the cart with quantity 3
    And I open the cart
    Then product 1 is in the cart with quantity 5

  @TC17
  Scenario: Remove products from the cart
    When I add product 1 to the cart
    And I open the cart
    Then the cart contains exactly the added products
    When I remove product 1 from the cart
    Then the cart replies "Cart removed"
    And the cart is empty

  @TC20
  Scenario: Searched products stay in the cart after logging in
    Given a registered user exists
    When I search for "Jeans"
    Then products are returned
    When I add every product found to the cart
    And I open the cart
    Then the cart contains exactly the added products
    When I log in to the site with the user's credentials
    Then I am logged in as the user
    When I open the cart
    Then the cart contains exactly the added products

  @session
  Scenario: Each session has its own cart
    When I add product 1 to the cart
    Then a new session sees an empty cart
