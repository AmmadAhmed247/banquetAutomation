import axios from "axios";

const receiptService = {
    sendReceipt: async (data)=> {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/receipt/sendReceipt`, data)
            const responseData = res.data
            console.log(responseData)
            return responseData
        } catch (error) {
            console.log("An Error Occured In Service (Client): ", error)
        }
    }
}

export default receiptService