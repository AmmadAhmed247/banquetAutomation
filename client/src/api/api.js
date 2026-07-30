import axios from "axios"

export default axios.create({
    baseURL: "https://raabta.tech",
    withCredentials: true,
})      
