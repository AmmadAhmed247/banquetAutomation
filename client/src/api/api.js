import axios from "axios"

export default axios.create({
    baseURL: "https://api.raabta.tech",
    withCredentials: true,
})      

// http://localhost:3000
//https://api.raabta.tech
//  import.meta.env.ENVIRONMENT == "production" ? import.meta.env.PROD_URL : import.meta.env.DEV_URL