@cart
Feature: Cart
  As a shopper
  I want to add, review and remove products in my cart
  So that I buy exactly what I need

  Background:
    Given I am on the home page

  @TC12 @smoke
  Scenario: Add products to the cart
    When I click "Products" in the header
    And I add the product at position 1 to the cart
    And I continue shopping
    And I add the product at position 2 to the cart
    And I view the cart from the pop-up
    Then the cart contains exactly the added products
    And each cart row has the listed price, quantity 1 and a matching total

  @TC13
  Scenario: Product quantity is kept in the cart
    When I open product 1 from the home page
    Then the product details page is shown
    When I set the quantity to 4
    And I add the product to the cart from its details page
    And I view the cart from the pop-up
    Then product 1 is in the cart with quantity 4

  @TC17
  Scenario: Remove products from the cart
    When I click "Products" in the header
    And I add the product at position 1 to the cart
    And I continue shopping
    And I click "Cart" in the header
    Then the cart page is shown
    And the cart contains the added products
    When I remove the added products from the cart
    Then the cart is empty

  @TC20
  Scenario: Searched products stay in the cart after logging in
    Given a registered user exists
    When I click "Products" in the header
    And I search for "Jeans"
    Then the listing title is "Searched Products"
    When I add every listed product to the cart
    And I click "Cart" in the header
    Then the cart contains the added products
    When I click "Signup / Login" in the header
    And I log in with the user's credentials
    Then I am logged in as the user
    When I click "Cart" in the header
    Then the cart contains the added products

  @TC22
  Scenario: Add a recommended item to the cart
    When I scroll to the bottom of the page
    Then the recommended items are visible
    When I add the first recommended product to the cart
    And I view the cart from the pop-up
    Then the cart contains the added products
