import axios from "axios"

export default axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})      


// http://localhost:3000
//https://api.raabta.tech