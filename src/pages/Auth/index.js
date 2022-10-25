import React from 'react';
import st from "./auth.module.css"
import {useForm} from "react-hook-form";
import * as bcrypt from "bcryptjs-react";
import {useDispatch, useSelector} from "react-redux";
import {fetchAuth, selectIsAuth} from "../../redux/slices/auth";
import {Redirect} from "react-router-dom";


export const Auth = () => {
    const dispatch = useDispatch()
    const isAuth = useSelector(selectIsAuth)
    console.log(isAuth)

    const { register, handleSubmit, formState: {errors}, reset } = useForm({
        defaultValues: {
            nickname: "",
            password: "",
        },
        mode: "onChange"
    })

    const onSubmit = async (value) => {
        const data = await dispatch(fetchAuth(value))
        if (!data.payload) {
            return alert("Не удалось авторизоваться!")
        }

        // сохраняем токен в локал хранилище браузера
        if ('token' in data.payload) {
            window.localStorage.setItem('token', data.payload.token);
        }
        // reset()
    }

    if (isAuth) {
        return <Redirect to="/admin" />
    }

    return (
        <div className={st.container}>
            <div className={st.authBlock}>
                <span style={{display: "inline-block", fontSize: 26, fontWeight: 400, marginBottom: 10}}>Войти</span>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        className={st.input}
                        type={"text"}
                        placeholder={"Никнейм"}
                        {...register("nickname", {
                            required: "Укажите никнейм",
                            minLength: {
                                value: 2,
                                message: "Минимум 2 символа"
                            }
                        })}
                    />
                    <div className={st.inputErrorMessage}>
                        {errors?.nickname && <p>{errors?.nickname?.message}</p>}
                    </div>
                    <input
                        className={st.input}
                        type={"password"}
                        placeholder={"Пароль"}
                        {...register("password", {
                            required: "Укажите пароль",
                            minLength: {
                                value: 2,
                                message: "Минимум 2 символа"
                            }
                        })}
                    />
                    <div className={st.inputErrorMessage}>
                        {errors?.password && <p>{errors?.password?.message}</p>}
                    </div>
                    <div className={st.subButtonBox}>
                        <button type={"submit"} className={st.submitButton}>Отправить</button>
                    </div>
                </form>
            </div>

        </div>
    );
};

