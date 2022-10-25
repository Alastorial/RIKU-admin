import {configureStore} from "@reduxjs/toolkit";
import {authReducer} from "./slices/auth";
// import {authReducer} from "./slices/auth";

// подключение в харнилище редьюсеров
const store = configureStore({
    reducer: {
        // projects: projectsReducer,
        auth: authReducer
    }
})

export default store;