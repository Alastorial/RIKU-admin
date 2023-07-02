import axios from "axios";



const instance = axios.create({
    // baseURL: 'http://localhost:8080'
    //     baseURL: 'https://api.riku-remont.ru'
        baseURL: 'https://api2.riku-remont.ru'
})

// вшили токен в каждый запрос на сервер
instance.interceptors.request.use((config) => {
    config.headers.Authorization = window.localStorage.getItem('token');
    return config;
})
export default instance;