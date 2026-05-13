import api from "../api/api";

const bookingService = {
    getAllBookings: async ()=> {
        try {
            const res = await api.get("/api/booking/allBookings")

            const responseData = res.data.bookings || []

            console.log(responseData)

            return responseData

        } catch (error) {
            console.log("Error In Bookings (Client): ", error)
            throw error
        }
    }
}

export default bookingService