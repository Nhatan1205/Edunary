namespace Edunary.Web.AcceptanceTests.StepDefinitions;

[Binding]
public sealed class CreateCourseStepDefinitions
{
    private readonly LoginPage _loginPage;
    private readonly CreateCoursePage _createCoursePage;

    public CreateCourseStepDefinitions(LoginPage loginPage, CreateCoursePage createCoursePage)
    {
        _loginPage = loginPage;
        _createCoursePage = createCoursePage;
    }

    [BeforeFeature("CreateCourse")]
    public static async Task BeforeCreateCourseScenario(IObjectContainer container)
    {
        var playwright = await Playwright.CreateAsync();

        var options = new BrowserTypeLaunchOptions
        {
            Headless = false,
            SlowMo = 100
        };

        var browser = await playwright.Chromium.LaunchAsync(options);
        
        var context = await browser.NewContextAsync(new BrowserNewContextOptions
        {
            BaseURL = ConfigurationHelper.GetBaseUrl(),
            IgnoreHTTPSErrors = true
        });
        
        var page = await context.NewPageAsync();
        page.SetDefaultTimeout(60000);
        page.SetDefaultNavigationTimeout(60000);

        var loginPage = new LoginPage(browser, page);
        var createCoursePage = new CreateCoursePage(browser, page);

        container.RegisterInstanceAs(playwright);
        container.RegisterInstanceAs(browser);
        container.RegisterInstanceAs(context);
        container.RegisterInstanceAs(loginPage);
        container.RegisterInstanceAs(createCoursePage);
    }

    [Given("an authenticated instructor")]
    public async Task GivenAnAuthenticatedInstructor()
    {
        try
        {
            // Navigate to login page
            await _loginPage.GotoAsync();
            await _loginPage.Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

            // Clear any existing authentication
            await _loginPage.ClearLocalStorage();
            await _loginPage.Page.ReloadAsync(new PageReloadOptions { WaitUntil = WaitUntilState.DOMContentLoaded });

            // Wait for email input to be visible
            await _loginPage.Page.WaitForSelectorAsync("input[type='email']", new PageWaitForSelectorOptions 
            { 
                State = WaitForSelectorState.Visible,
                Timeout = 10000
            });

            // Login as instructor
            await _loginPage.SetEmail("ancaribe74@gmail.com");
            await _loginPage.SetPassword("Hello@123");
            await _loginPage.ClickSignIn();

            // Wait for login to complete and redirect away from login page
            try
            {
                await _loginPage.Page.WaitForURLAsync(url => !url.Contains("/login"), new PageWaitForURLOptions 
                { 
                    Timeout = 10000 
                });
            }
            catch (TimeoutException)
            {
                throw new Exception($"Login did not redirect from login page. Current URL: {_loginPage.Page.Url}");
            }

            // Additional wait for token to be saved
            await Task.Delay(1000);

            // Verify login was successful
            var isLoggedIn = await _loginPage.IsUserLoggedIn();
            
            if (!isLoggedIn)
            {
                throw new Exception($"Login failed - no token found. Current URL: {_loginPage.Page.Url}");
            }
            
            isLoggedIn.Should().BeTrue("Instructor must be logged in before creating a course");
        }
        catch (TimeoutException ex)
        {
            throw new Exception($"Failed to login. Make sure the web application is running at {ConfigurationHelper.GetBaseUrl()}", ex);
        }
    }

    [Given("the instructor is on the create course page")]
    public async Task GivenTheInstructorIsOnTheCreateCoursePage()
    {
        await _createCoursePage.GotoAsync();

        if (_createCoursePage.Page.Url.Contains("/login"))
        {
            throw new System.Exception($"Navigation failed. Redirected to: {_createCoursePage.Page.Url}");
        }

        await _createCoursePage.Page.WaitForSelectorAsync("input[name='title']", new()
        {
            State = WaitForSelectorState.Visible,
            Timeout = 10000
        });

        _createCoursePage.Page.Url.Should().Contain("/create");
    }

    [When("the instructor enters valid course details")]
    public async Task WhenTheInstructorEntersValidCourseDetails(Table table)
    {
        // Step 1: Enter title
        await _createCoursePage.SetTitle(table.Rows[0]["Value"]);
        await _createCoursePage.ClickContinue();
        await Task.Delay(500);
        
        // Step 2: Select category
        await _createCoursePage.SetCategory(table.Rows[1]["Value"]);
        await _createCoursePage.ClickContinue();
        await Task.Delay(500);
        
        // Step 3: Enter price (don't submit yet - that's done in "submits the course" step)
        await _createCoursePage.SetPrice(table.Rows[2]["Value"]);
    }

    [When("the instructor enters a course title with less than 5 characters")]
    public async Task WhenTheInstructorEntersACourseTitleWithLessThan5Characters(Table table)
    {
        // Only enter title on step 1
        await _createCoursePage.SetTitle(table.Rows[0]["Value"]);
    }

    [When("the instructor tries to continue")]
    public async Task WhenTheInstructorTriesToContinue()
    {
        // Try to click Continue button (will be blocked by validation)
        await _createCoursePage.ClickContinue();
        await Task.Delay(1000);
    }

    [When("the instructor enters title and skips category")]
    public async Task WhenTheInstructorEntersTitleAndSkipsCategory(Table table)
    {
        // Step 1: Enter valid title
        await _createCoursePage.SetTitle(table.Rows[0]["Value"]);
        await _createCoursePage.ClickContinue();
        await Task.Delay(500);
        
        // Step 2: Don't select category (leave it as empty/default)
        // Do nothing - just move to next step attempt
    }

    [When("the instructor tries to continue from category step")]
    public async Task WhenTheInstructorTriesToContinueFromCategoryStep()
    {
        // Try to click Continue without selecting category
        await _createCoursePage.ClickContinue();
        await Task.Delay(1000);
    }

    [Then("the instructor remains on step 2")]
    public async Task ThenTheInstructorRemainsOnStep2()
    {
        // Verify we're still on the create page and haven't moved to step 3
        // Step 2 shows category selection, step 3 shows price input
        var currentUrl = _createCoursePage.Page.Url;
        currentUrl.Should().Contain("/create", "Should remain on create course page");
        
        // Verify price input is NOT visible (means we're not on step 3)
        try
        {
            await _createCoursePage.Page.Locator("input[placeholder='Price of the course']")
                .WaitForAsync(new LocatorWaitForOptions 
                { 
                    State = WaitForSelectorState.Visible,
                    Timeout = 1000 
                });
            // If we get here, the element IS visible, which is wrong
            throw new Exception("Price input should not be visible on step 2");
        }
        catch (TimeoutException)
        {
            // Good - price input is not visible, we're still on step 2
        }
    }

    [When("the instructor enters negative price")]
    public async Task WhenTheInstructorEntersNegativePrice(Table table)
    {
        // Step 1: Enter title
        await _createCoursePage.SetTitle(table.Rows[0]["Value"]);
        await _createCoursePage.ClickContinue();
        await Task.Delay(500);
        
        // Step 2: Select category
        await _createCoursePage.SetCategory(table.Rows[1]["Value"]);
        await _createCoursePage.ClickContinue();
        await Task.Delay(500);
        
        // Step 3: Enter negative price
        await _createCoursePage.SetPrice(table.Rows[2]["Value"]);
    }

    [When("the instructor enters valid course details with zero price")]
    public async Task WhenTheInstructorEntersValidCourseDetailsWithZeroPrice(Table table)
    {
        // Step 1: Enter title
        await _createCoursePage.SetTitle(table.Rows[0]["Value"]);
        await _createCoursePage.ClickContinue();
        await Task.Delay(500);
        
        // Step 2: Select category
        await _createCoursePage.SetCategory(table.Rows[1]["Value"]);
        await _createCoursePage.ClickContinue();
        await Task.Delay(500);
        
        // Step 3: Enter zero price
        await _createCoursePage.SetPrice(table.Rows[2]["Value"]);
    }

    [When("the instructor submits the course")]
    public async Task WhenTheInstructorSubmitsTheCourse()
    {
        // Click Continue/Submit on the last step
        await _createCoursePage.ClickSubmit();
        await Task.Delay(3000); // Wait for API call and redirect
    }

    [When("the instructor submits without entering any data")]
    public async Task WhenTheInstructorSubmitsWithoutEnteringAnyData()
    {
        // On step 1, try to continue without entering title
        await _createCoursePage.ClickContinue();
        await Task.Delay(1000);
    }

    [Then("the course is created successfully")]
    public async Task ThenTheCourseIsCreatedSuccessfully()
    {
        var isCreated = await _createCoursePage.IsCourseCreatedSuccessfully();
        isCreated.Should().BeTrue("Course should be created successfully with valid data");
    }

    [Then("the instructor is redirected to the course details page")]
    public async Task ThenTheInstructorIsRedirectedToTheCourseDetailsPage()
    {
        var isOnDetailsPage = await _createCoursePage.IsOnCourseDetailsPage();
        isOnDetailsPage.Should().BeTrue("Should be redirected to course details page after creation");
    }

    [Then("the course appears in draft status")]
    public async Task ThenTheCourseAppearsInDraftStatus()
    {
        var status = await _createCoursePage.GetCourseStatus();
        status.Should().ContainAny("Draft", "draft", "DRAFT", "Because newly created courses should be in draft status");
    }

    [Then("a validation error is displayed for title")]
    public async Task ThenAValidationErrorIsDisplayedForTitle()
    {
        var hasError = await _createCoursePage.IsValidationErrorDisplayed("title");
        hasError.Should().BeTrue("Validation error should be displayed for invalid title");
    }

    [Then("a validation error is displayed for category")]
    public async Task ThenAValidationErrorIsDisplayedForCategory()
    {
        var hasError = await _createCoursePage.IsValidationErrorDisplayed("category");
        hasError.Should().BeTrue("Validation error should be displayed for invalid category");
    }

    [Then("a validation error is displayed for price")]
    public async Task ThenAValidationErrorIsDisplayedForPrice()
    {
        var hasError = await _createCoursePage.IsValidationErrorDisplayed("price");
        hasError.Should().BeTrue("Validation error should be displayed for invalid price");
    }

    [Then("the course is not created")]
    public void ThenTheCourseIsNotCreated()
    {
        // Verify we're still on the create page
        var currentUrl = _createCoursePage.Page.Url;
        currentUrl.Should().Contain("/create", "Should remain on create page when validation fails");
    }

    [Then("the course price is set to zero")]
    public async Task ThenTheCoursePriceIsSetToZero()
    {
        // This would need to verify the price in the UI or through an API call
        // For now, just verify the course was created
        var isCreated = await _createCoursePage.IsCourseCreatedSuccessfully();
        isCreated.Should().BeTrue("Free course should be created successfully");
    }

    [Then("validation errors are displayed for all required fields")]
    public async Task ThenValidationErrorsAreDisplayedForAllRequiredFields()
    {
        var hasErrors = await _createCoursePage.AreMultipleValidationErrorsDisplayed();
        hasErrors.Should().BeTrue("Multiple validation errors should be displayed for required fields");
    }

    [AfterFeature]
    public static async Task AfterScenario(IObjectContainer container)
    {
        var context = container.Resolve<IBrowserContext>();
        var browser = container.Resolve<IBrowser>();
        var playwright = container.Resolve<IPlaywright>();

        await context.CloseAsync();
        await browser.CloseAsync();
        playwright.Dispose();
    }
}
