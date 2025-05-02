const BASE_URL = "http://localhost:5001/api";

const apiService = {
    async registerUser(userData) {
        try {
            const response = await fetch(`${BASE_URL}/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to register user");
            }

            return response.json();
        } catch (error) {
            console.error("Error in registerUser:", error.message);
            return { message: error.message };
        }
    },

    async loginUser(credentials) {
        try {
            const response = await fetch(`${BASE_URL}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            const contentType = response.headers.get("content-type");

            // Handle unexpected HTML response
            if (!response.ok) {
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to log in");
                } else {
                    const errorText = await response.text();
                    throw new Error("Unexpected response from server: " + errorText.slice(0, 100));
                }
            }

            return await response.json();
        } catch (error) {
            console.error("Error in loginUser:", error.message);
            return { message: error.message };
        }
    },

    async addTrade(tradeData, token) {
        try {
            const response = await fetch(`${BASE_URL}/trades`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(tradeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add trade");
            }

            return response.json();
        } catch (error) {
            console.error("Error in addTrade:", error.message);
            return { message: error.message };
        }
    },

    async getTrades(token) {
        try {
            const response = await fetch(`${BASE_URL}/trades`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch trades");
            }

            return response.json();
        } catch (error) {
            console.error("Error in getTrades:", error.message);
            return { message: error.message };
        }
    },
};

export default apiService;