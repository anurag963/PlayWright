@auth
Feature: Authentication
  As a shopper
  I want to register, log in and log out
  So that I can manage my account

  Background:
    Given I am on the home page

  @TC1 @smoke
  Scenario: Register a new user
    Given I have details for a new user
    When I click "Signup / Login" in the header
    Then the signup form is visible
    When I start signing up with the user's name and email
    Then the account information form is visible
    When I fill in the account information
    And I fill in the address information
    And I submit the account form
    Then the account is created
    When I continue
    Then I am logged in as the user
    When I click "Delete Account" in the header
    Then the account is deleted
    And I continue

  @TC2 @smoke
  Scenario: Log in with correct email and password
    Given I use the account from the environment file
    When I click "Signup / Login" in the header
    Then the login form is visible
    When I log in with the user's credentials
    Then I am logged in as the user
    # The .env account is shared, so it is logged out instead of deleted.
    When I click "Logout" in the header
    Then I am on the login page

  @TC2b
  Scenario: Log in and delete the account
    Given a registered user exists
    When I click "Signup / Login" in the header
    And I log in with the user's credentials
    Then I am logged in as the user
    When I click "Delete Account" in the header
    Then the account is deleted
    And I continue

  @TC3
  Scenario: Log in with incorrect email and password
    When I click "Signup / Login" in the header
    Then the login form is visible
    When I log in with email "not.registered.user@example.com" and password "WrongPassword!1"
    Then I see the login error "Your email or password is incorrect!"

  @TC4
  Scenario: Log out
    Given I use the account from the environment file
    When I click "Signup / Login" in the header
    And I log in with the user's credentials
    Then I am logged in as the user
    When I click "Logout" in the header
    Then I am on the login page

  @TC5
  Scenario: Register with an email that already exists
    Given I use the account from the environment file
    When I click "Signup / Login" in the header
    Then the signup form is visible
    When I start signing up with the user's name and email
    Then I see the signup error "Email Address already exist!"
