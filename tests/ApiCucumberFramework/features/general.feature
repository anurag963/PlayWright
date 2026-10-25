@general
Feature: Contact and pages
  As a site visitor's client
  I want to reach the static pages and send the contact form
  So that visitors can find help and get in touch

  # The "Success!" banner is drawn by the page's JavaScript, so over HTTP
  # the scenario checks the server accepts the form.
  @TC6 @smoke
  Scenario: Submit the Contact Us form
    When I submit the contact form with:
      | name    | PW Tester                                         |
      | subject | Automation feedback                               |
      | message | This message was sent by the API Cucumber suite.  |
      | file    | upload.txt                                        |
    Then the form submission is accepted

  @TC6
  Scenario: Contact form without a CSRF token is rejected
    When I submit the contact form without a CSRF token
    Then the page responds with status 403

  @TC7
  Scenario Outline: Open the <page> page
    When I open the "<path>" page
    Then the page responds with status 200
    And the page shows "<text>"

    Examples:
      | page       | path        | text                          |
      | Test Cases | /test_cases | Test Case 1: Register User    |
      | API list   | /api_list   | API 1: Get All Products List  |

  @methods
  Scenario Outline: <method> <endpoint> is not supported
    When I send an unsupported <method> request to "<endpoint>"
    Then the response code is 405 with message "This request method is not supported."

    Examples:
      | method | endpoint          |
      | POST   | /api/productsList |
      | PUT    | /api/brandsList   |
      | DELETE | /api/verifyLogin  |
