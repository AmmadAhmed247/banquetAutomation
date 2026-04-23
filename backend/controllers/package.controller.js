const { createPackage } = require("../services/package.service")

async function createNewPackage(req,res) {
    try {
        const {package_name, time, price} = req.body

        if(!package_name || !time || !price){
            return res.status(401).json({
                message: "All Fields Are Required!"
            })
        }

        const result = await createPackage(package_name, time, price)

        if(!result.success){
            return res.status(401).json(result)
        }

        return res.status(200).json(result)

    } catch (error) {
        console.log("An Error Occured: ", error)
    }
}

module.exports = {
    createNewPackage
}