import { test, expect, Page } from '@playwright/test'

// run all tests in serial mode
//test.describe.configure({mode:'serial'})

// parallel
test.describe.configure({mode:'parallel'})

test("Test1", async ({ page, browserName }) => {
    console.log("Test1")

})

test("Test2", async () => {
    console.log("Test2")

})

test("Test3", async () => {
    console.log("Test3")

})


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