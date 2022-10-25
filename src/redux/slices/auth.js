import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "../../axios";


// для логина
export const fetchAuth = createAsyncThunk('auth/fetchAuth', async (params) => {
    const {data} = await axios.post('/auth/login', params); // сам запрос
    return data;
})

// для получения инфы, когда уже авторизован. здесь не указываем параметры, тк токен уже вшит в каждый запрос
export const fetchAuthMe = createAsyncThunk('auth/fetchAuthMe', async () => {
    const {data} = await axios.get('/auth/me'); // сам запрос
    return data;
})

// для регисрации
export const fetchRegister = createAsyncThunk('auth/fetchAuth', async (params) => {
    const {data} = await axios.post('/auth/register', params); // сам запрос
    return data;
})

const initialState = {
    data: null,
    status: 'loading'
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.data = null;
        }
    },
    extraReducers: {
        [fetchAuth.pending]: (state) => {
            state.status = 'loading'
            state.data = null
        },
        [fetchAuth.fulfilled]: (state, action) => {
            state.status = 'loaded'
            state.data = action.payload
        },
        [fetchAuth.rejected]: (state) => {
            state.status = 'error'
            state.data = null
        }, // действия относительно состояний загрузки данных

        [fetchAuthMe.pending]: (state) => {
            state.status = 'loading'
            state.data = null
        },
        [fetchAuthMe.fulfilled]: (state, action) => {
            state.status = 'loaded'
            state.data = action.payload
        },
        [fetchAuthMe.rejected]: (state) => {
            state.status = 'error'
            state.data = null
        }, // действия относительно состояний загрузки данных

        [fetchRegister.pending]: (state) => {
            state.status = 'loading'
            state.data = null
        },
        [fetchRegister.fulfilled]: (state, action) => {
            state.status = 'loaded'
            state.data = action.payload
        },
        [fetchRegister.rejected]: (state) => {
            state.status = 'error'
            state.data = null
        },
    }
})

// обращаемся к глобальному хранилищу и проверяем, есть ли в auth что-то
// (это работает тк мы оборачиваем это в useSelector при вызове)
export const selectIsAuth = state => Boolean(state.auth.data)

export const authReducer = authSlice.reducer

export const { logout } = authSlice.actions;