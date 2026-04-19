const { eq } = require("drizzle-orm")
const {db} = require("../config/db")
const { user } = require("../model/schema")

async function getOrCreateUser(phone, name) {
    try {
        const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.phone, phone))
        .limit(1)
        .then(r => r[0])

        if(existingUser) return {
            success: true,
            isNew: false,
            user: existingUser
        }

        const newUser = await db
        .insert(user)
        .values({
            phone: phone,
            name: name
        })
        .returning()

        return {
            success: true,
            isNew: true,
            user: newUser
        }

    
    } catch (error) {
        console.log("Error In Creating New User: ", error)    
    }
}

module.exports = {
    getOrCreateUser
}