import axios from "axios";



const instance = axios.create({
    // baseURL: 'http://localhost:3002'
        baseURL: 'https://api.riku-remont.ru'
})

// вшили токен в каждый запрос на сервер
instance.interceptors.request.use((config) => {
    config.headers.Authorization = window.localStorage.getItem('token');
    return config;
})
export default instance;