@checkout
Feature: Checkout across API and UI
  As a shopper
  I want an order to reflect my cart no matter how the cart was filled
  So that I pay for exactly what I chose

  @HY18 @smoke
  Scenario: Order placed in the UI from a cart built via the API
    Given a registered user exists
    And I have the list of all products from the API
    # Arrange via the API: logged-in session with a known cart, no UI clicks.
    When I log in via the API
    And I add the product at position 1 to the cart via the API with quantity 2
    And I add the product at position 2 to the cart via the API
    # Act in the UI.
    And I proceed to checkout in the UI
    Then the UI order review lists the added products with their API prices
    When I place the order in the UI with the comment "Hybrid order: cart from API, checkout in UI."
    And I pay with a valid card in the UI
    Then the UI confirms the order
    # Assert in both layers.
    When I download the invoice in the UI
    Then the invoice total is the cart total calculated from API prices
    And the API cart is empty

  @HY19
  Scenario: Order paid via the API leaves the UI cart empty
    Given a registered user exists
    When I log in via the API
    And I add product 1 to the cart via the API
    And I open the cart page in the UI
    Then the UI cart lists the added products
    When I pay for the order via the API
    Then the API confirms the order
    When I open the cart page in the UI
    Then the UI cart is empty

  @HY20
  Scenario: The UI checkout review matches the cart built via the API
    Given a registered user exists
    When I search the API for "Saree"
    And I log in via the API
    And I add every product found to the cart via the API
    And I proceed to checkout in the UI
    Then the UI order review lists the added products with their API prices
