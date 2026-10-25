@checkout
Feature: Checkout API
  As a shopper's client
  I want to check out, pay and get an invoice
  So that orders can be placed without the browser

  @TC14
  Scenario: Place an order, registering during checkout
    Given I have details for a new user
    When I add product 1 to the cart
    And I create the user's account
    Then the response code is 201 with message "User created!"
    When I log in to the site with the user's credentials
    Then I am logged in as the user
    # The guest cart joins the user's cart when the cart page is opened.
    When I open the cart
    Then the cart contains exactly the added products
    When I open the checkout page
    Then the checkout shows the address details and order review
    And the order review lists the added products
    When I pay with a valid card
    Then the order is placed
    When I delete the user's account
    Then the response code is 200 with message "Account deleted!"

  @TC15
  Scenario: Place an order, registering before checkout
    Given I have details for a new user
    When I create the user's account
    Then the response code is 201 with message "User created!"
    When I log in to the site with the user's credentials
    And I add product 1 to the cart
    And I open the checkout page
    Then the checkout shows the address details and order review
    When I pay with a valid card
    Then the order is placed
    When I delete the user's account
    Then the response code is 200 with message "Account deleted!"

  @TC16 @smoke
  Scenario: Place an order, logging in before checkout
    Given a registered user exists
    When I log in to the site with the user's credentials
    And I add product 1 to the cart
    And I open the checkout page
    Then the checkout shows the user as logged in
    And the checkout shows the address details and order review
    When I pay with a valid card
    Then the order is placed
    And the cart is empty

  @TC23
  Scenario Outline: Checkout shows the registered <block> address
    Given a registered user exists
    When I log in to the site with the user's credentials
    And I add product 1 to the cart
    And I open the checkout page
    Then the <block> address matches the user

    Examples:
      | block    |
      | delivery |
      | billing  |

  @TC23
  Scenario: Checkout shows the address updated through the API
    Given a registered user exists
    When I update the user's account with:
      | address1 | 742 Evergreen Terrace |
      | city     | Springfield           |
    Then the response code is 200 with message "User updated!"
    When I log in to the site with the user's credentials
    And I add product 1 to the cart
    And I open the checkout page
    Then the delivery address matches the user
    And the billing address matches the user

  @TC24 @smoke
  Scenario: Download the invoice after placing an order
    Given a registered user exists
    And I have the list of all products
    When I log in to the site with the user's credentials
    And I add the product at position 1 to the cart with quantity 2
    And I add the product at position 2 to the cart
    And I pay with a valid card
    Then the order is placed
    And the order amount equals the cart total
    When I download the invoice
    Then the invoice file is downloaded
    And the invoice names the user and the order amount
