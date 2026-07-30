import axios from "axios"

export default axios.create({
    baseURL: "https://api.raabta.tech",
    withCredentials: true,
})      
