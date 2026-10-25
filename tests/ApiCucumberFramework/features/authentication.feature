@auth
Feature: Authentication API
  As an API consumer
  I want to create, verify, update and delete accounts
  So that users can register and log in

  @TC1 @smoke
  Scenario: Register a new user
    Given I have details for a new user
    When I create the user's account
    Then the response code is 201 with message "User created!"
    When I verify the login with the user's credentials
    Then the response code is 200 with message "User exists!"
    When I fetch the user's details by email
    Then the response code is 200
    And the user details match the user
    When I delete the user's account
    Then the response code is 200 with message "Account deleted!"
    When I verify the login with the user's credentials
    Then the response code is 404 with message "User not found!"

  @TC2
  Scenario: Log in with correct email and password
    Given I use the account from the environment file
    When I verify the login with the user's credentials
    Then the response code is 200 with message "User exists!"
    When I log in to the site with the user's credentials
    Then I am logged in as the user
    When I log out

  @TC2b
  Scenario: Log in and delete a throwaway user
    Given a registered user exists
    When I log in to the site with the user's credentials
    Then I am logged in as the user
    When I delete the user's account
    Then the response code is 200 with message "Account deleted!"
    When I verify the login with the user's credentials
    Then the response code is 404 with message "User not found!"

  @TC3
  Scenario: Log in with an unknown email
    When I verify the login with an unknown email
    Then the response code is 404 with message "User not found!"
    When I log in to the site with an unknown email
    Then the login fails with "Your email or password is incorrect!"

  @TC3
  Scenario: Log in with a wrong password
    Given I use the account from the environment file
    When I verify the login with the user's email and a wrong password
    Then the response code is 404 with message "User not found!"

  @TC3
  Scenario: Verify login without an email
    When I verify the login without an email
    Then the response code is 400 with message "Bad request, email or password parameter is missing in POST request."

  @TC4
  Scenario: Log out
    Given I use the account from the environment file
    When I log in to the site with the user's credentials
    Then I am logged in as the user
    When I log out
    Then I am on the login page
    And no user is logged in

  @TC5
  Scenario: Register with an email that already exists
    Given I use the account from the environment file
    When I try to create an account with the user's email
    Then the response code is 400 with message "Email already exists!"

  @account
  Scenario: Update a user account
    Given a registered user exists
    When I update the user's account with:
      | company  | Updated Labs      |
      | city     | Mysore            |
      | address1 | 10 Downing Street |
    Then the response code is 200 with message "User updated!"
    When I fetch the user's details by email
    Then the user details match the user

  @account
  Scenario: Get user details for an unknown email
    When I fetch user details for an unknown email
    Then the response code is 404 with message "Account not found with this email, try another email!"

  @account
  Scenario: Get user details without an email
    When I fetch user details without an email
    Then the response code is 400 with message "Bad request, email parameter is missing in GET request."
