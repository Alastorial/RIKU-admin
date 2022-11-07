import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {logout, selectIsAuth} from "../../redux/slices/auth";
import {Redirect, useParams} from "react-router-dom";
import st from "./EditProject.module.css"
import axios from "../../axios";
import {useForm} from "react-hook-form";

export const Admin = () => {
    const isAuth = useSelector(selectIsAuth)
    const dispatch = useDispatch()
    const id = useParams().id;
    const [projectInfo, setProjectInfo] = useState({})



    const onClickLogout = () => {
        if (window.confirm('Вы действительно хотите выйти ?')) {
            dispatch(logout()); // это делается именно так тк данные о пользователе хранятся в store, поэтому
            // logout находится именно там, мы его оттуда импортируем
            window.localStorage.removeItem('token')
        }
    };

    const onSubmit = (data) => {
        console.log(data)
    }

    const { register, handleSubmit, formState: {errors}, reset, setValue } = useForm({
        // defaultValues: {
        //     name: projectInfo.name,
        //     description: projectInfo.description,
        //     type: projectInfo.type,
        //     address: projectInfo.address,
        //     place: projectInfo.place,
        //     numberOfRooms: projectInfo.numberOfRooms,
        //     area: projectInfo.area,
        //     popular: projectInfo.popular,
        //     date: projectInfo.date
        // },
        mode: "onBlur"
    })

    // этот проект мы получаем с сервера
    useEffect(() => {
        axios.get(`/projects/${id}`).then(res => {
            setProjectInfo(res.data)
            setValue('name', res.data.name, { shouldValidate: true })
            setValue('description', res.data.description, { shouldValidate: true })
            setValue('type', res.data.type, { shouldValidate: true })
            setValue('address', res.data.address, { shouldValidate: true })
            setValue('place', res.data.place, { shouldValidate: true })
            setValue('numberOfRooms', res.data.numberOfRooms, { shouldValidate: true })
            setValue('area', res.data.area, { shouldValidate: true })
            setValue('popular', res.data.popular, { shouldValidate: true })
            let date = res.data.date.split(".").reverse().join('-');
            setValue('date', date, { shouldValidate: true })
        });
    }, [id])

    return (
        <div>
            <button onClick={onClickLogout}>Выйти</button>
            <div className={st.container}>
                <span className={st.title}>Редактор проекта</span>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        className={st.input}
                        type={"text"}
                        placeholder={"Название проекта"}
                        {...register("name", {
                            required: "Укажите название проекта",
                            minLength: {
                                value: 2,
                                message: "Минимум 2 символа"
                            }
                        })}
                    />
                    <textarea
                        className={`${st.input} ${st.textArea}`}
                        placeholder={"Описание"}
                        {...register("description", {
                            required: "Укажите описание проекта",
                            minLength: {
                                value: 10,
                                message: "Минимум 10 символов"
                            }
                        })}
                    />
                    <div className={st.tagsBlock}>
                        <input
                            className={`${st.input} ${st.inputTags}`}
                            type={"text"}
                            placeholder={"Адрес"}
                            {...register("address", {
                                required: "Укажите адрес проекта",
                                minLength: {
                                    value: 2,
                                    message: "Минимум 2 символа"
                                }
                            })}
                        />
                        <input
                            className={`${st.input} ${st.inputTags}`}
                            type={"text"}
                            placeholder={"Жилой комплекс"}
                            {...register("place", {
                                required: "Укажите ЖК проекта",
                                minLength: {
                                    value: 2,
                                    message: "Минимум 2 символа"
                                }
                            })}
                        />
                        <input
                            className={`${st.input} ${st.inputTags}`}
                            type={"number"}
                            placeholder={"Кол-во комнат"}
                            {...register("numberOfRooms", {
                                required: "Укажите кол-во комнат проекта",
                                minLength: {
                                    value: 1,
                                    message: "Минимум 1 символ"
                                }
                            })}
                        />
                        <input
                            className={`${st.input} ${st.inputTags}`}
                            type={"number"}
                            placeholder={"Площадь"}
                            {...register("area", {
                                required: "Укажите площадь проекта",
                                minLength: {
                                    value: 1,
                                    message: "Минимум 1 символ"
                                }
                            })}
                        />
                        <input
                            className={`${st.input} ${st.inputTags}`}
                            type={"date"}
                            placeholder={"Дата публикации"}
                            {...register("date", {
                                required: "Укажите дату публикации проекта",
                                minLength: {
                                    value: 1,
                                    message: "Минимум 1 символ"
                                }
                            })}
                        />
                    </div>


                    <div className={st.inputErrorMessage}>
                        {errors?.name && <p>{errors?.name?.message}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

