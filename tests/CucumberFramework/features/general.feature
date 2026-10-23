@general
Feature: Contact, navigation and footer
  As a visitor
  I want to contact the shop, subscribe and move around the site
  So that I can get help and stay informed

  Background:
    Given I am on the home page

  @TC6 @smoke
  Scenario: Submit the Contact Us form
    When I click "Contact Us" in the header
    Then the "Get In Touch" section is visible
    When I fill in the contact form with:
      | name    | PW Tester                                 |
      | subject | Automation feedback                       |
      | message | Sent by the Playwright Cucumber framework. |
    And I attach the file "upload.txt"
    And I submit the contact form and confirm
    Then I see the contact message "Success! Your details have been submitted successfully."
    When I click the Home button on the contact page
    Then the home page is visible

  @TC7
  Scenario: Open the Test Cases page
    When I click "Test Cases" in the header
    Then I am on the test cases page

  @TC10
  Scenario: Subscribe from the home page
    When I scroll down to the footer
    Then the subscription section is visible
    When I subscribe with a new email address
    Then I see the subscription message "You have been successfully subscribed!"

  @TC11
  Scenario: Subscribe from the cart page
    When I click "Cart" in the header
    And I scroll down to the footer
    Then the subscription section is visible
    When I subscribe with a new email address
    Then I see the subscription message "You have been successfully subscribed!"

  @TC25
  Scenario: Scroll up using the arrow button
    When I scroll to the bottom of the page
    Then the subscription section is in view
    When I click the scroll-up arrow
    Then the page banner is in view

  @TC26
  Scenario: Scroll up without the arrow button
    When I scroll to the bottom of the page
    Then the subscription section is in view
    When I scroll to the top of the page
    Then the page banner is in view
