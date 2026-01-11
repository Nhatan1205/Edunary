namespace Edunary.Web.AcceptanceTests.Pages;

public class LoginPage : BasePage
{
    public LoginPage(IBrowser browser, IPage page)
    {
        Browser = browser;
        Page = page;
    }

    public override string PagePath => $"{BaseUrl}/login";

    public override IBrowser Browser { get; }

    public override IPage Page { get; set; }

    // Locators for email and password fields based on your React form
    public Task SetEmail(string email)
        => Page.Locator("input[type='email']").FillAsync(email);

    public Task SetPassword(string password)
        => Page.Locator("input[type='password']").FillAsync(password);

    public Task ClickSignIn()
        => Page.Locator("button[type='submit']:has-text('Sign In')").ClickAsync();

    public async Task<bool> IsLoginSuccessful()
    {
        try
        {
            // After successful login, user should be redirected away from /login
            // Wait for navigation to complete
            await Page.WaitForURLAsync(url => !url.Contains("/login"), new PageWaitForURLOptions
            {
                Timeout = 5000
            });
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> IsErrorDisplayed()
    {
        try
        {
            // Wait for toast notification or error message
            // Based on your useLogin hook, errors are shown via toast
            var errorToast = Page.Locator(".Toastify__toast--error, [role='alert']:has-text('incorrect')");
            await errorToast.WaitForAsync(new LocatorWaitForOptions { Timeout = 3000 });
            return await errorToast.IsVisibleAsync();
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> IsUserLoggedIn()
    {
        try
        {
            // Check if token exists in localStorage
            // The token is stored as a JSON object with a 'value' property
            var tokenData = await Page.EvaluateAsync<string>(@"
                () => {
                    const tokenData = localStorage.getItem('access_token');
                    if (!tokenData) return null;
                    try {
                        const parsed = JSON.parse(tokenData);
                        return parsed.value || tokenData;
                    } catch {
                        return tokenData;
                    }
                }
            ");
            return !string.IsNullOrEmpty(tokenData);
        }
        catch
        {
            return false;
        }
    }

    public async Task ClearLocalStorage()
    {
        await Page.EvaluateAsync("() => localStorage.clear()");
    }
}
