@account
Feature: Accounts across API and UI
  As a shopper
  I want my account to work the same in the browser and over HTTP
  So that registering, logging in and updating details is consistent

  @HY12
  Scenario: A user created via the API can log in on the UI
    Given a registered user exists
    When I log in through the UI
    Then I am logged in as the user

  @HY13 @smoke
  Scenario: A user registered in the UI exists in the API with the entered details
    Given I have details for a new user
    When I register the user through the UI
    Then the API confirms the user exists
    And the API user details match what was entered in the UI

  @HY14
  Scenario: An account deleted in the UI is gone from the API
    Given a registered user exists
    When I log in through the UI
    And I delete the account in the UI
    Then the API reports the user does not exist

  @HY15
  Scenario: Logging in via the API logs the browser in
    Given a registered user exists
    When I log in via the API
    And I open the home page in the UI
    Then I am logged in as the user

  @HY16
  Scenario: Logging out in the UI ends the API session
    Given a registered user exists
    When I log in via the API
    And I open the home page in the UI
    Then I am logged in as the user
    When I log out in the UI
    Then the API session is logged out

  @HY17
  Scenario: An address updated via the API shows on the UI checkout page
    Given a registered user exists
    When I update the user's account via the API with:
      | company  | Hybrid Labs           |
      | address1 | 742 Evergreen Terrace |
      | city     | Springfield           |
    And I log in via the API
    And I add product 1 to the cart via the API
    And I proceed to checkout in the UI
    Then the UI delivery address matches the user
    And the UI billing address matches the user
