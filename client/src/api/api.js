import axios from "axios"

export default axios.create({
    baseURL: "https://banquet-automation.vercel.app",
    withCredentials: true,
})      