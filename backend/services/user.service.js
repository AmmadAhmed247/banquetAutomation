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

async function getAllUsers() {
    try {
        const allUsers = await db
        .select()
        .from(user)

        if(allUsers.length === 0){
            return {
                success: false,
                message: "No Users Found!"
            }
        }

        return {
            success: true,
            allUsers
        }

    } catch (error) {
        console.log("An Error Occured While Fetching Users (Service): ", error)
    }
}

module.exports = {
    getOrCreateUser,
    getAllUsers
}