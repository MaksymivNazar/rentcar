import api from "./axios";
import { API_ENDPOINTS } from "./endpoints";
import { cars as staticCars } from "../data/cars";

export const RentCarAPI = {
  // --- АВТОРИЗАЦІЯ ТА ПРОФІЛЬ ---
  auth: {
    login: async (credentials) => {
      try {
        const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
        localStorage.setItem('jwt_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        return response.data;
      } catch (err) {
        // Емуляція для розробки
        const isAdmin = credentials.email === 'admin@olimp.com' && credentials.password === 'admin777';
        const mockUser = {
          name: isAdmin ? 'Адміністратор' : credentials.email.split('@')[0],
          email: credentials.email,
          role: isAdmin ? 'admin' : 'user'
        };
        localStorage.setItem('jwt_token', "fake-jwt-token");
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        return { user: mockUser, token: "fake-jwt-token" };
      }
    },

    register: async (userData) => {
      try {
        const response = await api.post(API_ENDPOINTS.REGISTER, userData);
        localStorage.setItem('jwt_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        return response.data;
      } catch (err) {
        const mockUser = { ...userData, role: 'user' };
        localStorage.setItem('jwt_token', "fake-jwt-token");
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        return { user: mockUser, token: "fake-jwt-token" };
      }
    },

    getCurrentUser: async () => {
      const data = localStorage.getItem('user_data');
      return data ? JSON.parse(data) : null;
    }
  },

  // --- РОБОТА З АВТОМОБІЛЯМИ ---
  cars: {
    getAll: async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CARS);
        return response.data;
      } catch (err) {
        // Поєднуємо список машин із датами бронювання з localStorage
        const userBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
        const adminCars = JSON.parse(localStorage.getItem('persistent_cars')) || staticCars;

        return adminCars.map(car => {
          const booking = userBookings.find(b => String(b.carId) === String(car.id));
          return {
            ...car,
            bookedUntil: booking ? booking.endDate : null
          };
        });
      }
    },

    getById: async (id) => {
      try {
        const response = await api.get(`${API_ENDPOINTS.CARS}/${id}`);
        return response.data;
      } catch (err) {
        const all = await RentCarAPI.cars.getAll();
        return all.find(c => String(c.id) === String(id));
      }
    },

    create: async (carData) => {
      try {
        return await api.post(API_ENDPOINTS.CARS, carData);
      } catch (err) {
        const currentCars = JSON.parse(localStorage.getItem('persistent_cars')) || staticCars;
        const newCar = { ...carData, id: Date.now() };
        localStorage.setItem('persistent_cars', JSON.stringify([newCar, ...currentCars]));
        return newCar;
      }
    }
  },

  // --- ОРЕНДА ТА БРОНЮВАННЯ ---
  rentals: {
    getUserBookings: async () => {
      try {
        const response = await api.get(API_ENDPOINTS.RENTALS);
        return response.data;
      } catch (err) {
        return JSON.parse(localStorage.getItem('user_bookings') || '[]');
      }
    },

    create: async (bookingData) => {
      try {
        return await api.post(API_ENDPOINTS.RENTALS, bookingData);
      } catch (err) {
        const existing = JSON.parse(localStorage.getItem('user_bookings') || '[]');
        const allCars = await RentCarAPI.cars.getAll();
        const car = allCars.find(c => String(c.id) === String(bookingData.carId));

        const newBooking = { 
          ...bookingData, 
          id: Date.now(),
          carName: car?.name || 'Авто',
          carImage: car?.image || '',
          createdAt: new Date().toISOString() 
        };

        localStorage.setItem('user_bookings', JSON.stringify([newBooking, ...existing]));
        return { success: true };
      }
    },

    cancel: async (id) => {
      try {
        return await api.delete(`${API_ENDPOINTS.RENTALS}/${id}`);
      } catch (err) {
        const bookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
        const filtered = bookings.filter(b => String(b.id) !== String(id));
        localStorage.setItem('user_bookings', JSON.stringify(filtered));
        return { success: true };
      }
    }
  }
};