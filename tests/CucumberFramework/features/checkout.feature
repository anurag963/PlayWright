@checkout
Feature: Checkout
  As a shopper
  I want to place an order and get an invoice
  So that I receive the products I paid for

  Background:
    Given I am on the home page

  @TC14 @smoke
  Scenario: Place an order, registering during checkout
    Given I have details for a new user
    When I add a product to the cart
    And I click "Cart" in the header
    Then the cart page is shown
    When I proceed to checkout
    And I choose to register or log in
    And I register the user through the signup form
    And I click "Cart" in the header
    And I proceed to checkout
    Then the address details and order review are shown
    And the order review lists 1 product
    When I place the order with the comment "Please deliver between 9am and 5pm."
    And I pay with a valid card
    Then the order is confirmed
    When I click "Delete Account" in the header
    Then the account is deleted
    And I continue

  @TC15
  Scenario: Place an order, registering before checkout
    Given I have details for a new user
    When I click "Signup / Login" in the header
    And I register the user through the signup form
    And I add a product to the cart
    And I click "Cart" in the header
    Then the cart page is shown
    When I proceed to checkout
    Then the address details and order review are shown
    When I place the order with the comment "Order placed by automated test."
    And I pay with a valid card
    Then the order is confirmed
    When I click "Delete Account" in the header
    Then the account is deleted
    And I continue

  @TC16
  Scenario: Place an order, logging in before checkout
    Given a registered user exists
    When I click "Signup / Login" in the header
    And I log in with the user's credentials
    Then I am logged in as the user
    When I add a product to the cart
    And I click "Cart" in the header
    Then the cart page is shown
    When I proceed to checkout
    Then the address details and order review are shown
    When I place the order with the comment "Order placed by automated test."
    And I pay with a valid card
    Then the order is confirmed
    When I click "Delete Account" in the header
    Then the account is deleted
    And I continue

  @TC23
  Scenario: Checkout shows the address entered at registration
    Given I have details for a new user
    When I click "Signup / Login" in the header
    And I register the user through the signup form
    And I add a product to the cart
    And I click "Cart" in the header
    Then the cart page is shown
    When I proceed to checkout
    Then the delivery address matches the registration details
    And the billing address matches the registration details
    When I click "Delete Account" in the header
    Then the account is deleted
    And I continue

  @TC24
  Scenario: Download the invoice after placing an order
    Given I have details for a new user
    When I add a product to the cart
    And I click "Cart" in the header
    Then the cart page is shown
    When I proceed to checkout
    And I choose to register or log in
    And I register the user through the signup form
    And I click "Cart" in the header
    And I proceed to checkout
    Then the address details and order review are shown
    When I place the order with the comment "Invoice test order."
    And I pay with a valid card
    Then the order is confirmed
    When I download the invoice
    Then the invoice file is downloaded
    When I continue
    And I click "Delete Account" in the header
    Then the account is deleted
    And I continue
