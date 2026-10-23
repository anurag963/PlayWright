@products
Feature: Products
  As a shopper
  I want to browse, search and review products
  So that I can find what I want to buy

  Background:
    Given I am on the home page

  @TC8 @smoke
  Scenario: View all products and a product's details
    When I click "Products" in the header
    Then the listing title is "All Products"
    And products are listed
    When I view the product at position 1
    Then I see the product's name, category, price, availability, condition and brand

  @TC9
  Scenario Outline: Search for "<term>"
    When I click "Products" in the header
    Then the listing title is "All Products"
    When I search for "<term>"
    Then the listing title is "Searched Products"
    And every listed product name contains "<term>"

    Examples:
      | term  |
      | Jeans |
      | Saree |

  @TC18
  Scenario: View category products
    Then the category sidebar is visible
    When I open the "Women" category "Tops"
    Then the listing title is "Women - Tops Products"
    When I open the "Men" category "Jeans"
    Then the listing title is "Men - Jeans Products"
    And products are listed

  @TC19
  Scenario: View brand products
    When I click "Products" in the header
    Then the brands sidebar is visible
    When I open the brand "Polo"
    Then the listing title is "Brand - Polo Products"
    And products are listed
    When I open the brand "H&M"
    Then the listing title is "Brand - H&M Products"
    And products are listed

  @TC21
  Scenario: Add a review on a product
    When I click "Products" in the header
    Then the listing title is "All Products"
    When I view the product at position 1
    Then the "Write Your Review" section is visible
    When I submit a review "Great product, automated review!" as "PW Tester"
    Then I see the review confirmation "Thank you for your review."
