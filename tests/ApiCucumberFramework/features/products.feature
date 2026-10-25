@products
Feature: Products API
  As an API consumer
  I want to list, search and filter products and brands
  So that a shop front can show the catalogue

  @TC8 @smoke
  Scenario: Get all products list
    When I request the list of all products
    Then the response code is 200
    And products are returned
    And every product matches the product schema
    And every product has a unique id

  @TC8
  Scenario: A listed product has the same details on its page
    Given I have the list of all products
    When I open the details page of the product at position 1
    Then the page responds with status 200
    And the page shows the product's name, category, price and brand

  @TC9
  Scenario Outline: Search products for "<term>"
    When I search for "<term>"
    Then the response code is 200
    And products are returned
    And every product name contains "<term>"

    Examples:
      | term  |
      | Jeans |
      | Saree |

  @TC9
  Scenario: Search without a search term
    When I search without a search term
    Then the response code is 400 with message "Bad request, search_product parameter is missing in POST request."

  @search
  Scenario: Search for a men's shirt
    When I search for "Men Tshirt"
    Then the response code is 200
    And the only product returned is "Men Tshirt" in the "Men" category "Tshirts"

  @TC18
  Scenario Outline: Products exist in the <usertype> - <category> category
    Given I have the list of all products
    Then there are products in the "<usertype>" category "<category>"

    Examples:
      | usertype | category |
      | Women    | Tops     |
      | Men      | Jeans    |
      | Kids     | Dress    |

  @TC19 @smoke
  Scenario: Get all brands list
    When I request the list of all brands
    Then the response code is 200
    And every brand matches the brand schema
    And the brands include:
      | Polo |
      | H&M  |
    Given I have the list of all products
    Then every product's brand is in the brand list
