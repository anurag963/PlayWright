@products
Feature: Product catalogue across API and UI
  As a shopper
  I want the shop pages to show the same catalogue the API serves
  So that prices and products never disagree

  Background:
    Given I am on the home page

  @HY6 @smoke
  Scenario: The products page lists exactly the API products
    Given I have the list of all products from the API
    When I click "Products" in the header
    Then the UI listing shows exactly the API products in the same order

  @HY7
  Scenario Outline: UI search for "<term>" returns the API search results
    When I search the API for "<term>"
    And I click "Products" in the header
    And I search for "<term>" in the UI
    Then the UI listing shows exactly the API products in the same order

    Examples:
      | term  |
      | Jeans |
      | Saree |
      | Top   |

  @HY8
  Scenario: Product details pages show the API data
    Given I have the list of all products from the API
    Then the UI details pages of the first 5 products show their API name, price, category and brand

  @HY9
  Scenario: The brands sidebar lists exactly the API brands
    When I get the list of all brands from the API
    And I click "Products" in the header
    Then the UI brands sidebar lists exactly the API brands

  @HY10
  Scenario Outline: The <brand> brand page lists the API's <brand> products
    Given I have the list of all products from the API
    When I click "Products" in the header
    And I open the brand "<brand>" in the UI
    Then the UI listing shows the API products of brand "<brand>"

    Examples:
      | brand |
      | Polo  |
      | H&M   |

  @HY11
  Scenario Outline: The <usertype> - <category> page lists the API's products in that category
    Given I have the list of all products from the API
    When I open the "<usertype>" category "<category>" in the UI
    Then the UI listing shows the API products in the "<usertype>" category "<category>"

    Examples:
      | usertype | category |
      | Women    | Tops     |
      | Men      | Jeans    |
