import api from "../utils/axios"

export const getCurrentUser = async () => {
    try {
        const res = await api.get("/me")
        return res.data
    } catch (error) {
        return null
    }
}
