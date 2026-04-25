const {getOrCreateUser, getAllUsers} = require("../services/user.service")

async function GetOrRegisterUser(req,res) {
    try {
        const {name, phone} = req.body

        if(!name || !phone){
            return res.status(401).json({
                message: "No Name Or Phone!"
            })
        }

        const result = await getOrCreateUser(phone, name)

        if(!result.success){
            return res.status(401).json(result)
        }

        const status = result?.isNew ? 201 : 200

        return res.status(status).json({
            isNew: result.isNew,
            user: result.user
        })

    } catch (error) {
        console.log("An Error Occured In User Controller (Get/Register): ", error)
    }
}

async function fetchAllUsers(req,res){
    try {
        const result = await getAllUsers()

        if(!result){
           return res.status(401).json(result)
        }

        return res.status(200).json(result)

    } catch (error) {
        console.log("Error While Fetching Users (Controller): ", error)
    }
}

module.exports = {
    GetOrRegisterUser,
    fetchAllUsers
}