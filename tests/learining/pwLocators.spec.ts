
// Shft + Alt + A > multiline comment
/* page.getByRole() to locate by explicit and implicit accessibility attributes.
page.getByText() to locate by text content.
page.getByLabel() to locate a form control by associated label's text.
page.getByPlaceholder() to locate an input by placeholder.
page.getByAltText() to locate an element, usually image, by its text alternative.
page.getByTitle() to locate an element by its title attribute.
page.getByTestId() to locate an element based on its data-testid attribute (other attributes can be configured).
 */

import { test, expect, Locator } from "@playwright/test"


test("Verify PlayWright built in loocators", async ({ page }) => {
    await page.goto("https://www.xqa.io/practice");
    //await page.goto("https://demo.nopcommerce.com/");

    /*   const logo:Locator= page.getByAltText("nopCommerce demo store")
      await logo.click()
      await expect(logo).toBeVisible(); */


    const text1: Locator = page.getByText("Welcome to the Practice Area")
    await expect(text1).toBeVisible();

    const btn: Locator = page.getByRole('link', { name: "Buttons" }).nth(1)
    //console.log(await btn.count());
    await btn.click()
    let title: string = await page.title()
    console.log("Title", title)
    await expect(page).toHaveTitle("Buttons - Automation Testing Practice | XQA");

    await page.getByRole('link', { name: "Text Box" }).click()
    await page.getByLabel("Full Name").fill("asd");

    let text2 = await page.getByRole('textbox', { name: "Full Name" }).getAttribute("value");
    console.log(text2)
    expect(text2).toEqual("asd");


})


test("Playwright Action", async ({ page }) => {
    await page.goto("https://www.xqa.io/practice/check-box");

    const checkBxValues: string[] = ["Desktop", "Documents", "Downloads"]
    const checkBxs: Locator[] = checkBxValues.map(x => page.getByText(x, { exact: true }).locator("xpath=preceding-sibling::div[1]"));
    console.log(checkBxs)
    expect(checkBxs.length).toBe(3)

    for (const chx of checkBxs) {
        await chx.click()
    }


})

test("Autosuggest dropdown", async ({ page }) => {
    await page.goto("https://www.flipkart.com/");
    await page.getByRole("button", {name:'✕'}).click()

    await page.locator("input[name='q']").first().fill("iphone")
    await page.waitForTimeout(10000)    
    

    const options: Locator = page.locator("ul>li")
    const count = await options.count()
    console.log(count)
    expect(count).toBe(8)
    // for(let i=0; i<count; i++){
    //     console.log(await options.nth(i).innerText())
    // }


    // let optionsText:string[]= await page.locator("ul>li").allInnerTexts()
    // optionsText.map(x=> console.log(x))


    let optionsLoc:Locator[]= await options.all();
     console.log(optionsLoc)
     console.log(await optionsLoc[0].innerText())
 


  


})


