import axios from "axios";



const instance = axios.create({
    baseURL: 'https://riku-backend.herokuapp.com'
})

// вшили токен в каждый запрос на сервер
instance.interceptors.request.use((config) => {
    config.headers.Authorization = window.localStorage.getItem('token');
    return config;
})
export default instance;