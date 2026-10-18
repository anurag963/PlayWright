import { test, expect } from "@playwright/test"



/*test("title", ()=>{

})*/

// fixtures- global variable - page, browser
test("Verify Title", async ({ page }) => {
    await page.goto("https://www.xqa.io/practice");
    let title:string= await page.title()
    console.log("Title", title)

    //await expect(page).toHaveTitle("40+ Free Automation Testing Practice Exercises | Selenium, Cypress, Playwright | XQA");
    await expect(page).toHaveTitle(/Free Automation Testing Practice Exercises/);

})
