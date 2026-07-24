import axios from "axios"

export default axios.create({
    baseURL: "https://banquetautomation.onrender.com",
    withCredentials: true,
})      