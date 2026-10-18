import { test, expect, Page } from '@playwright/test'
import fs from 'fs';



/* const loginData: string[][] = [
    ['username1', 'password1', 'valid'],
    ['username2', 'password2', 'valid'],
    ['username3', 'password3', 'invalid']

]; */


// Reading data from json
/* const jsonPath= "testData/loginData.json"
const loginData:any= JSON.parse(fs.readFileSync(jsonPath, 'utf-8')); */

interface LoginData {
    email: string;
    password: string;
    validity: string;
}

const jsonPath = "testData/loginData.json";

const loginData: LoginData[] = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8")
);

for (const {email, password, validity} of loginData) {

    test.describe("Login1 tests", async () => {
        test(`Login1 Test for ${email} and ${password}`, async () => {
            console.log("Login1 test")
            if (validity === 'invalid') {
                test.fail();
            }


        })
    })
}


