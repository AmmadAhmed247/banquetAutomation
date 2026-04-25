const { SendMessageToUser } = require("../services/message.service")

async function SendMessageManually(req,res) {
    try {
        const {phone, message} = req.body

        if(!phone || !message){
            return res.status(401).json({
                message: "Invalid Phone Or Message!"
            })
        }

        const result = await SendMessageToUser(phone, message)

        return {
            success: true,
            result
        }   

    } catch (error) {
        console.log("Error Occured In Send Message Manually (Controller): ", error)
    }
}

module.exports = {
    SendMessageManually
}