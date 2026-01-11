namespace Edunary.Web.AcceptanceTests.StepDefinitions;

[Binding]
public sealed class LoginStepDefinitions
{
    private readonly LoginPage _loginPage;

    public LoginStepDefinitions(LoginPage loginPage)
    {
        _loginPage = loginPage;
    }

    [BeforeFeature("Login")]
    public static async Task BeforeLoginScenario(IObjectContainer container)
    {
        var playwright = await Playwright.CreateAsync();

        var options = new BrowserTypeLaunchOptions
        {
            Headless = false, 
            SlowMo = 100
        };

        var browser = await playwright.Chromium.LaunchAsync(options);
        
        // Create a new context with extended timeout
        var context = await browser.NewContextAsync(new BrowserNewContextOptions
        {
            BaseURL = ConfigurationHelper.GetBaseUrl(),
            IgnoreHTTPSErrors = true 
        });
        
        var page = await context.NewPageAsync();
        
        page.SetDefaultTimeout(60000);
        page.SetDefaultNavigationTimeout(60000);

        var loginPage = new LoginPage(browser, page);

        container.RegisterInstanceAs(playwright);
        container.RegisterInstanceAs(browser);
        container.RegisterInstanceAs(context);
        container.RegisterInstanceAs(loginPage);
    }

    [Given("a logged out user")]
    public async Task GivenALoggedOutUser()
    {
        try
        {
            // Navigate to login page
            await _loginPage.GotoAsync();
            
            // Wait for page to be fully loaded
            await _loginPage.Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
            
            // Clear any existing authentication
            await _loginPage.ClearLocalStorage();
            
            // Reload the page to ensure clean state
            await _loginPage.Page.ReloadAsync(new PageReloadOptions 
            { 
                WaitUntil = WaitUntilState.DOMContentLoaded 
            });
            
            // Wait for the email input to be visible (indicates page is ready)
            await _loginPage.Page.WaitForSelectorAsync("input[type='email']", new PageWaitForSelectorOptions 
            { 
                State = WaitForSelectorState.Visible,
                Timeout = 10000
            });
        }
        catch (TimeoutException ex)
        {
            throw new Exception($"Failed to load login page. Make sure the web application is running at {ConfigurationHelper.GetBaseUrl()}/login", ex);
        }
    }

    [When("the user logs in with valid credentials")]
    public async Task TheUserLogsInWithValidCredentials()
    {
        // Fill in the email field
        await _loginPage.SetEmail("ancaribe74@gmail.com");
        
        // Fill in the password field
        await _loginPage.SetPassword("Hello@123");
        
        // Click the Sign In button
        await _loginPage.ClickSignIn();
        
        // Wait for either navigation or error message
        await Task.Delay(2000);
    }

    [Then("they log in successfully")]
    public async Task TheyLogInSuccessfully()
    {
        // Check if login was successful (redirected away from login page)
        var isSuccessful = await _loginPage.IsLoginSuccessful();
        isSuccessful.Should().BeTrue("User should be redirected after successful login");
        
        // Verify token is stored in localStorage
        var isLoggedIn = await _loginPage.IsUserLoggedIn();
        isLoggedIn.Should().BeTrue("Authentication token should be stored in localStorage");
    }

    [When("the user logs in with invalid credentials")]
    public async Task TheUserLogsInWithInvalidCredentials()
    {
        // Fill in invalid credentials
        await _loginPage.SetEmail("hacker@gmail.com");
        await _loginPage.SetPassword("Hello@123");
        
        // Click the Sign In button
        await _loginPage.ClickSignIn();
        
        // Wait for error message to appear
        await Task.Delay(2000);
    }

    [Then("an error is displayed")]
    public async Task AnErrorIsDisplayed()
    {
        // Check if error message is displayed
        var errorDisplayed = await _loginPage.IsErrorDisplayed();
        errorDisplayed.Should().BeTrue("Error message should be displayed for invalid credentials");
        
        // Verify user is still on login page
        var currentUrl = _loginPage.Page.Url;
        currentUrl.Should().Contain("/login", "User should remain on login page after failed login");
        
        // Verify no token is stored
        var isLoggedIn = await _loginPage.IsUserLoggedIn();
        isLoggedIn.Should().BeFalse("No authentication token should be stored after failed login");
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
