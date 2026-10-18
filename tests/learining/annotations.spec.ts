import { test, expect, Page } from '@playwright/test'


/*
    only - runs only one test
    skip - skip test
    fail - fail the test
    fixme - Need to be implemented, test will be skipped
    slow - makes execution slow by 3 times the default wait
*/

/*
    Test tags - 
*/

// npx playwright test --grep "@smoke"
// npx playwright test --grep "(?=.*@smoke)(?=.*@sanity)"   -> this is to run test having both tags
// npx playwright test --grep "@smoke|@sanity"   -> this is to run test having either one of these tags
// npx playwright test --grep "@smoke" --grep-invert "@sanity"   -> this is to run test having tag smoke but not sanity

// skip test base on condition
test("Test1", async ({ page, browserName }) => {
    test.skip(browserName === "firefox", "Copndition not matching") // skip for firefox

    console.log("Test1")

})

test("Test2", async () => {
    console.log("Test2")

})

test("Test3", async () => {
    console.log("Test3")

})


// tags
test("@sanity @regression Test4", async () => {
    console.log("Test4")

})


test("Test5", {
    tag: '@smoke'
}, async () => {
    console.log("Test5");
});


test("Test6", {
    tag: ['@smoke', '@sanity']
}, async () => {
    console.log("Test6");
});