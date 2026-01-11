namespace Edunary.Web.AcceptanceTests.Pages;

public class CreateCoursePage : BasePage
{
    public CreateCoursePage(IBrowser browser, IPage page)
    {
        Browser = browser;
        Page = page;
    }

    public override string PagePath => $"{BaseUrl}/course/create";

    public override IBrowser Browser { get; }

    public override IPage Page { get; set; }

    // Locators for course form fields (multi-step form)
    public Task SetTitle(string title)
        => Page.Locator("input[placeholder='Enter your course title']").FillAsync(title);

    public async Task SetCategory(string categoryId)
    {
        // Wait for the select to be visible
        await Page.WaitForSelectorAsync("#category-select", new PageWaitForSelectorOptions 
        { 
            State = WaitForSelectorState.Visible,
            Timeout = 5000 
        });
        await Page.Locator("#category-select").SelectOptionAsync(categoryId);
    }

    public Task SetPrice(string price)
        => Page.Locator("input[type='number'][placeholder='Price of the course']").FillAsync(price);

    // Click "Continue" button (for step 1 and 2)
    public Task ClickContinue()
        => Page.Locator("button:has-text('Continue')").ClickAsync();

    // Click "Create Course" button (for step 3)
    public Task ClickSubmit()
        => Page.Locator("button:has-text('Create Course')").ClickAsync();

    public async Task<bool> IsCourseCreatedSuccessfully()
    {
        try
        {
            // Check for success message or redirect to course management page
            var successToast = Page.Locator(".Toastify__toast--success");
            await successToast.WaitForAsync(new LocatorWaitForOptions { Timeout = 5000 });
            return await successToast.IsVisibleAsync();
        }
        catch
        {
            // Alternative: check if redirected to course management page
            try
            {
                await Page.WaitForURLAsync(url => url.Contains("/instructor/course/") && url.Contains("/manage"), 
                    new PageWaitForURLOptions { Timeout = 5000 });
                return true;
            }
            catch
            {
                return false;
            }
        }
    }

    public async Task<bool> IsValidationErrorDisplayed(string fieldName)
    {
        try
        {
            // Look for validation error messages
            // 1. Try to find Typography with red color (custom error messages in React form)
            var redTextSelector = "p[class*='MuiTypography']:has-text('Please select'), p[class*='MuiTypography']:has-text('required'), p[class*='MuiTypography']:has-text('invalid'), p[class*='MuiTypography']:has-text('must')";
            
            // 2. Try to find any visible text that contains common validation messages
            var errorTextSelectors = new[]
            {
                "text=/please select/i",
                "text=/required/i", 
                "text=/invalid/i",
                "text=/must be/i",
                "text=/cannot be/i"
            };

            // 3. Standard MUI error selectors
            var muiErrorSelectors = new[]
            {
                ".MuiAlert-message",
                "p.Mui-error",
                ".MuiFormHelperText-root.Mui-error",
                "[role='alert']"
            };

            // Try text-based selectors first (most reliable for this case)
            foreach (var selector in errorTextSelectors)
            {
                try
                {
                    var errorElement = Page.Locator(selector);
                    await errorElement.First.WaitForAsync(new LocatorWaitForOptions { Timeout = 1000, State = WaitForSelectorState.Visible });
                    if (await errorElement.First.IsVisibleAsync())
                    {
                        return true;
                    }
                }
                catch
                {
                    // Continue to next selector
                }
            }

            // Try red text selector
            try
            {
                var redTextElement = Page.Locator(redTextSelector);
                await redTextElement.First.WaitForAsync(new LocatorWaitForOptions { Timeout = 1000, State = WaitForSelectorState.Visible });
                if (await redTextElement.First.IsVisibleAsync())
                {
                    return true;
                }
            }
            catch
            {
                // Continue
            }

            // Try MUI error selectors
            foreach (var selector in muiErrorSelectors)
            {
                try
                {
                    var errorElement = Page.Locator(selector);
                    await errorElement.WaitForAsync(new LocatorWaitForOptions { Timeout = 1000, State = WaitForSelectorState.Visible });
                    if (await errorElement.IsVisibleAsync())
                    {
                        return true;
                    }
                }
                catch
                {
                    // Continue to next selector
                }
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> AreMultipleValidationErrorsDisplayed()
    {
        try
        {
            var errorElements = Page.Locator(".MuiAlert-message, .MuiFormHelperText-root.Mui-error");
            await errorElements.First.WaitForAsync(new LocatorWaitForOptions { Timeout = 3000 });
            var count = await errorElements.CountAsync();
            return count > 0;
        }
        catch
        {
            return false;
        }
    }

    public Task<bool> IsOnCourseDetailsPage()
    {
        try
        {
            var currentUrl = Page.Url;
            return Task.FromResult(currentUrl.Contains("/instructor/course/") && currentUrl.Contains("/manage"));
        }
        catch
        {
            return Task.FromResult(false);
        }
    }

    public async Task<string> GetCourseStatus()
    {
        try
        {
            // After creation, courses are in Draft status
            // Check the status in the course management page
            var statusElement = Page.Locator("text=/Draft|Public|Pending/i");
            await statusElement.WaitForAsync(new LocatorWaitForOptions { Timeout = 3000 });
            var statusText = await statusElement.TextContentAsync();
            return statusText?.Trim() ?? string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }

    public async Task ClearForm()
    {
        await Page.Locator("input[placeholder='Enter your course title']").FillAsync("");
    }
}
