import { test, expect, Locator, Page } from '@playwright/test'

test("Date picker 1", async ({ page }) => {
    await page.goto("https://testautomationpractice.blogspot.com/");

    const datePicker: Locator = page.locator('#datepicker').nth(0)
    expect(datePicker).toBeVisible()
    //await datePicker.fill("10/05/2026")

    await datePicker.click()

    const year: string = "2025"
    const mponth: string = "January"
    const day: string = "13"

    const expectedDate= '01/13/2025'

    let isFuture:boolean= isFutureDate(expectedDate)

    await selectdate(year, mponth, day, page, isFuture)
    
    
    await expect(datePicker).toHaveValue(expectedDate)

})


async function selectdate(year: string, month: string, day: string, page: Page, isFutureDate: boolean) {

    while (true) {
        const currentMonth = await page.locator(".ui-datepicker-month").textContent()
        const currentYear = await page.locator(".ui-datepicker-year").textContent()

        if (currentYear === year && currentMonth === month) {
            break;
        }

        if (isFutureDate) {
            await page.locator(".ui-datepicker-next").click()
        } else {
            await page.locator(".ui-datepicker-prev").click()
        }
    }

    const allDatesLoc = await page.locator(".ui-datepicker-calendar td").all()

    for (let dateLoc of allDatesLoc) {
        const dateText = await dateLoc.innerText()
        if (dateText === day) {
            await dateLoc.click()
            break;
        }
    }
}

function isFutureDate(date: string): boolean {
    const givenDate = new Date(date);
    const today = new Date();

    givenDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return givenDate > today;
}
