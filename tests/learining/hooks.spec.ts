import { test, expect } from '@playwright/test'


test.beforeAll("beforeAll", async()=>{
    console.log("beforeAll")
})

test.afterAll("afterAll", async()=>{
    console.log("afterAll")
})

test.beforeEach("BeforeEach", async()=>{
    console.log("BeforeEach")
})

test.afterEach("AfterEach", async()=>{
    console.log("AfterEach")
})

test("Test1", async () => {
    console.log("Test1")
})

test("Test2", async () => {
    console.log("Test2")
})



test("Test3", async () => {
    console.log("Test3")
})

test("Test4", async () => {
    console.log("Test4")
})





