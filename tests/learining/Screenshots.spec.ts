import { test, expect, Locator, Page, chromium } from '@playwright/test'



test("Screenshots", async ({ page }) => {
    await page.goto("https://www.xqa.io/practice");
    let title:string= await page.title()
    console.log("Title", title)
    await expect(page).toHaveTitle(/Free Automation Testing Practice Exercises/);

    const timeStamp= Date.now()

    // page screenshot
    await page.screenshot({path:'screenshots/'+'homepage'+timeStamp+'.png'})

    // Full page screenshot
    await page.screenshot({path:'screenshots/'+'homepageFull'+timeStamp+'.png', fullPage:true})

    const link:Locator= page.getByRole('link', {name:"Text Box"}).nth(0)
    expect(link).toBeVisible()

    // Element screenshot
    await link.screenshot({path:'screenshots/'+'link'+timeStamp+'.png'})

    await link.click()

})

test("Screenshots from config", async ({ page }) => {
    // Screenshots will be attached to the report automatically
    await page.goto("https://www.xqa.io/practice");
    let title:string= await page.title()
    console.log("Title", title)
    await expect(page).toHaveTitle(/Free Automation Testing Practice Exercises/);

    const link:Locator= page.getByRole('link', {name:"Text Box1"}).nth(0)
    expect(link).toBeVisible()
    await link.click()

})

test.only("Recording test", async ({ page, context }) => {

    // generate screenshot and video
    context.tracing.start({screenshots:true, snapshots:true})

    await page.goto("https://www.xqa.io/practice");
    let title:string= await page.title()
    console.log("Title", title)
    await expect(page).toHaveTitle(/Free Automation Testing Practice Exercises/);

    const link:Locator= page.getByRole('link', {name:"Text Box"}).nth(0)
    expect(link).toBeVisible()
    await link.click()

    // generate trace
    context.tracing.stop({path:'trace.zip'})

})





