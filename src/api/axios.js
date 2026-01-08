import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Бекендщик запустить сервер тут
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Додаємо токен адміна/юзера в кожен запит
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Спрощуємо відповідь (Response)
api.interceptors.response.use(
  (response) => response.data, 
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login'; 
    }
    return Promise.reject(error.response?.data || "Помилка сервера");
  }
);

export default api;