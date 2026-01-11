@CreateCourse
Feature: Create Course
    Instructor can create a new course

Background:
    Given an authenticated instructor

Scenario: Instructor can create a course with valid data
    Given the instructor is on the create course page
    When the instructor enters valid course details
        | Field      | Value                           |
        | Title      | Introduction to Web Development |
        | CategoryId | 1                               |
        | Price      | 29.99                           |
    And the instructor submits the course
    Then the course is created successfully
    And the instructor is redirected to the course details page
    And the course appears in draft status

Scenario: Instructor cannot create a course with title too short
    Given the instructor is on the create course page
    When the instructor enters a course title with less than 5 characters
        | Field | Value |
        | Title | Web   |
    And the instructor tries to continue
    Then a validation error is displayed for title
    And the course is not created

Scenario: Instructor cannot proceed without selecting a category
    Given the instructor is on the create course page
    When the instructor enters title and skips category
        | Field | Value                           |
        | Title | Introduction to Web Development |
    And the instructor tries to continue from category step
    Then a validation error is displayed for category
    And the instructor remains on step 2

Scenario: Instructor cannot create a course with negative price
    Given the instructor is on the create course page
    When the instructor enters negative price
        | Field      | Value                           |
        | Title      | Introduction to Web Development |
        | CategoryId | 1                               |
        | Price      | -10.00                          |
    And the instructor submits the course
    Then a validation error is displayed for price
    And the course is not created

Scenario: Instructor can create a free course
    Given the instructor is on the create course page
    When the instructor enters valid course details with zero price
        | Field      | Value                            |
        | Title      | Free Introduction to Programming |
        | CategoryId | 1                                |
        | Price      | 0                                |
    And the instructor submits the course
    Then the course is created successfully
    And the course price is set to zero

Scenario: Required fields validation on step 1
    Given the instructor is on the create course page
    When the instructor submits without entering any data
    Then validation errors are displayed for all required fields
    And the course is not created
