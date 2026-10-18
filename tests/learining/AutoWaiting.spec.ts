import { test, expect, Locator, Page, chromium } from '@playwright/test'



test("Time out changes", async ({ page }) => {
    // set timeout for a test
    test.setTimeout(60000)

    // triple the timeout
    //test.slow()

    await page.goto("https://www.xqa.io/practice");
    let title:string= await page.title()
    console.log("Title", title)

    //await expect(page).toHaveTitle("40+ Free Automation Testing Practice Exercises | Selenium, Cypress, Playwright | XQA");
    await expect(page).toHaveTitle(/Free Automation Testing Practice Exercises/);

    const link:Locator= page.getByRole('link', {name:"Text Box"}).nth(0)
    //const link= page.locator("(//a[text()='Text Box'])[1]")

    // timeout for except
    expect(link).toBeVisible({timeout:60000})

    // perform action without auto waiting
    await link.click({force:true})


})



