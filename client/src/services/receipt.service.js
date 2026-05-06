import api from "../api/api";

const receiptService = {
    sendReceipt: async (data)=> {
        try {
            const res = await api.post("/api/receipt/sendReceipt", data)

            const responseData = res.data

            console.log(responseData)

            return responseData

        } catch (error) {
            console.log("An Error Occured In Service (Client): ", error)
        }
    }
}

export default receiptService