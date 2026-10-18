import { test, expect, Page } from '@playwright/test'


const searchItems: string[] = ['laptop', 'smartphone', 'monitor']


for (const item of searchItems) {
    test(`Search for ${item}`, async () => {
        console.log("Test1")
        console.log("Item is ", item)

    })
}


test.describe("Search Items tests", async () => {
    searchItems.forEach((item) => {
        test(`Search1 for ${item}`, async () => {
            console.log("Test1")
            console.log("Item is ", item)

        })
    })

})





test("Test2", async () => {
    console.log("Test2")

})



