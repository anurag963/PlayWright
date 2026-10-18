import { test, expect, Locator, Page, chromium } from '@playwright/test'

test("Simple Dialog", async ({ page }) => {
    await page.goto("https://www.xqa.io/practice/alerts");
    //await page.locator("#alertButton").click()

    // Register a dialog handler
    page.on('dialog', (dlg) => {
        console.log("dialog type is: ", dlg.type())
        console.log("dialog message is: ", dlg.message())
        expect(dlg.message()).toContain("Do you confirm action?")
        dlg.accept()
    })
    await page.locator("#confirmButton").click() // open dialogs
    //await page.waitForTimeout(5000)
})

test("Fill text to dialog", async ({ page }) => {
    await page.goto("https://www.xqa.io/practice/alerts");
    //await page.locator("#alertButton").click()

    // Register a dialog handler
    page.on('dialog', (dlg) => {
        console.log("dialog type is: ", dlg.type())
        console.log("dialog message is: ", dlg.message())
        //expect(dlg.type()).toContain("confirm")
        expect(dlg.message()).toContain("Please enter your name")
        dlg.accept("John")
    })
    await page.locator("#promtButton").click() // open dialogs
    let enteredText = await page.locator("#promptResult").innerText()
    expect(enteredText).toContain("John")
    //await page.waitForTimeout(5000)
})


test("Handle Frame", async ({ page }) => {
    await page.goto("https://www.xqa.io/practice/nested-frames")


    /*     const frame1= page.frameLocator("#frame1")
        const frame2= frame1.frameLocator("//iframe[contains(@srcdoc, 'Child Iframe')]")
        const txt= await frame2.locator("//p").innerText()
        console.log(txt) */

    /*     const frameElement = page.locator("#frame1");
        const elementHandle = await frameElement.elementHandle();
        const frame1 = await elementHandle?.contentFrame(); */

    const f = page.frame({ name: "frame1" })
    if (!f) {
        throw new Error("Frame 'frame1' not found");
    }
    const childFrames = f.childFrames();
    console.log("Child frame count:", childFrames?.length);
    const txt = await childFrames[0].locator("//p").innerText()
    console.log(txt)

})


test("Browser", async () => {

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage()

    await page.goto("https://www.xqa.io/practice/nested-frames")
})

test("Multiple pages", async () => {

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    await page1.goto("https://www.xqa.io/practice")
    await page2.goto("https://www.xqa.io/practice/nested-frames")

    console.log("pages created ", context.pages().length)
})


test("Handle tabs", async () => {

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const parentPage = await context.newPage()
    await parentPage.goto("https://www.xqa.io/practice/browser-windows")

    // waitforEvent and click should run parallel using Promis.all()
    /*     context.waitForEvent('page') // pending, fulfill, rejected
        //await page1.locator("#tabButton").click()
        await page1.locator("button:has-text('New Tab')").click() */

    const [childPage] = await Promise.all([context.waitForEvent('page'), await parentPage.locator("button:has-text('New Tab')").click()])

    // Approach 1
    const pages = context.pages()
    console.log("pages ", pages.length)
    console.log("Parent page ", await pages[0].title())
    console.log("Child page ", await pages[1].title())

    // Approach 2
    console.log("Parent page ", await parentPage.title())
    console.log("Child page ", await childPage.title())

})

test("Handle PopUps", async () => {

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage()
    await page.goto("https://testautomationpractice.blogspot.com/")

    /* await Promise.all([page.waitForEvent('popup'), await page.locator("#PopUp").click()]) // for one popup
        // Approach 1
        const allPopups= context.pages()
        console.log("Popups ", allPopups.length)
        console.log("Parent page ",  allPopups[0].url())
        console.log("Child page ",  allPopups[1].url())
        console.log("Child page ",  allPopups[2].url()) */


    const popups: Page[] = [];
    context.on("page", newPage => {
        popups.push(newPage);
    });

    await page.locator("#PopUp").click();

    // Allow time for popup creation to finish
    await page.waitForTimeout(2000);

    /* console.log("Popups ", popups.length)
     console.log("Popup1 ", popups[0].url())
     console.log("Popup2 ", popups[1].url()) */
    //console.log("Child page ", popups[2].url())

    let myPopup: any = null;
    console.log("Number of popups:", popups.length);
    for (const popup of popups) {
        await popup.waitForLoadState();
        console.log("URL:", popup.url());
        console.log("Title:", await popup.title());

        //if (await popup.title() === "Fast and reliable end-to-end testing for modern web apps | Playwright") {
        if ((await popup.title()).includes("Playwright")) {
            /*             await popup.getByRole('link', { name: "Get started" }).click()
                        await popup.waitForTimeout(2000)
                        console.log(await popup.title()) */
            myPopup = popup;
        }
    }

    await myPopup.getByRole('link', { name: "Get started" }).click()
    await myPopup.waitForTimeout(2000)
    console.log(await myPopup.title())

    for (const popup of popups) {
        await popup.close()
    }

    await page.waitForTimeout(2000)
})

test("Auth Popup", async ({ browser }) => {
    /*     const context = await browser.newContext();
        const page = await context.newPage()
        await page.goto("https://admin:admin@the-internet.herokuapp.com/basic_auth") // we can pass username pass with url also
        await page.waitForLoadState() */



    const context = await browser.newContext({httpCredentials:{username:'admin', password:'admin'}});
    const page = await context.newPage()
    await page.goto("https://the-internet.herokuapp.com/basic_auth") // we can pass username pass with url also
    await page.waitForLoadState()

})

