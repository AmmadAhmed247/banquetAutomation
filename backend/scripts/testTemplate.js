// scripts/testTemplate.js
require("dotenv").config()
const { sendTemplateMessage } = require("../services/meta.service..js")

async function test() {
    const result = await sendTemplateMessage(
        "92319822517", 
        "booking_reminder_v1",
        "en",
        ["Hashir", "Valima and barat "] 
    )


    console.log(JSON.stringify(result, null, 2))
   
}

test()