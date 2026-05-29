import api from "../api/api";

const contactService = {
    addClient:  async (data)=> {
        try {
            const res = await api.post("/api/client/create", data)

            const responseData = res.data

            return responseData

        } catch (error) {
            console.log("Error In Creating Client (Client): ", error)
            throw error
        }
    }
}


export default contactService