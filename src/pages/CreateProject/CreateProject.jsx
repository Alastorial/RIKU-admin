import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {logout, selectIsAuth} from "../../redux/slices/auth";
import {Redirect, useParams} from "react-router-dom";
import st from "./CreateProject.module.css"
import axios from "../../axios";
import {useForm} from "react-hook-form";
import Loader from "../../components/UI/Loader/Loader";
import {ReactComponent as Close} from "../../image/icons/close.svg";
import {ReactComponent as ChevronLeft} from "../../image/icons/chevron-left.svg";
import {ReactComponent as ChevronRight} from "../../image/icons/chevron-right.svg";
import {translate} from "../../utils/Utils";


export const CreateProject = () => {
    const dispatch = useDispatch()
    const [photo, setPhoto] = useState([])

    // массив с загруженными админом фотографиями
    const [newPhoto, setNewPhoto] = useState([]);

    const [newPhotoBase64, setNewPhotoBase64] = useState([]);

    const inputFileRef = useRef(null); // сюда мы привяжем поле для загрузки картинок

    const onClickLogout = () => {
        if (window.confirm('Вы действительно хотите выйти ?')) {
            dispatch(logout()); // это делается именно так тк данные о пользователе хранятся в store, поэтому
            // logout находится именно там, мы его оттуда импортируем
            window.localStorage.removeItem('token')
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData(); // это спец формат для вшития картинки и отправки ее на бэк

        // получаем загруженные файлы
        const files = inputFileRef.current.files;

        //добавляем их в formData
        for (let key of Object.keys(files)) {
            const newFile = new File([files[key]], translate(files[key].name));
            // files[key].name = translate(files[key].name)
            formData.append('postImage', newFile)
            // защита, чтобы не добавить дважды
            if (photo.indexOf(newFile.name) === -1) {
                photo.push(newFile.name)
            }
        }
        // загружаем фотографии на бэк
        await axios.post(`/image/${data.name}`, formData)

        // обновляем данные в монгоДБ
        data.date = data.date.split('-').reverse().join('.')
        const answer = await axios.post(`projects`, {photo: photo, preview: [], ...data});
        alert("success: " + answer.data.success);
        // <Redirect to="/admin/all" />
    }

    const {register, handleSubmit, formState: {errors}, reset, setValue} = useForm({mode: "onBlur"})

    function loadNewPhoto() {
        newPhotoBase64.length = 0
        setNewPhotoBase64(newPhotoBase64)

        var files = inputFileRef.current.files;

        function readAndPreview(file) {
            // console.log(file)

            var reader = new FileReader();

            reader.addEventListener("load", function () {
                newPhotoBase64.push(this.result);
                setNewPhotoBase64([...newPhotoBase64]);
            });

            reader.readAsDataURL(file);


        }

        if (files) {
            for (let i = 0; i < files.length; i++)
                readAndPreview(files[i]);
        }
        setNewPhoto(inputFileRef.current.files)

    }

    return (
        <div>
            <button onClick={onClickLogout}>Выйти</button>
            <div className={st.container}>
                <span className={st.title}>Редактор проекта</span>
                <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
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
                    <div className={st.inputErrorMessage}>
                        {errors?.name && <p>{errors?.name?.message}</p>}
                    </div>

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
                    <div className={st.inputErrorMessage}>
                        {errors?.description && <p>{errors?.description?.message}</p>}
                    </div>
                    <div className={st.tagsBlock}>
                        <div className={st.inputBlock}>
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
                            <div className={st.inputErrorMessage}>
                                {errors?.address && <p>{errors?.address?.message}</p>}
                            </div>
                        </div>
                        <div className={st.inputBlock}>
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
                            <div className={st.inputErrorMessage}>
                                {errors?.place && <p>{errors?.place?.message}</p>}
                            </div>
                        </div>

                        <div className={st.inputBlock}>
                            <input
                                className={`${st.input} ${st.inputTags}`}
                                type={"number"}
                                min={1}
                                placeholder={"Кол-во комнат"}
                                {...register("numberOfRooms", {
                                    required: "Укажите кол-во комнат проекта",
                                    minLength: {
                                        value: 1,
                                        message: "Минимум 1 символ"
                                    }
                                })}
                            />
                            <div className={st.inputErrorMessage}>
                                {errors?.numberOfRooms && <p>{errors?.numberOfRooms?.message}</p>}
                            </div>
                        </div>

                        <div className={st.inputBlock}>
                            <input
                                className={`${st.input} ${st.inputTags}`}
                                type={"number"}
                                min={1}
                                placeholder={"Площадь"}
                                {...register("area", {
                                    required: "Укажите площадь проекта",
                                    minLength: {
                                        value: 1,
                                        message: "Минимум 1 символ"
                                    }
                                })}
                            />
                            <div className={st.inputErrorMessage}>
                                {errors?.area && <p>{errors?.area?.message}</p>}
                            </div>
                        </div>

                        <div className={st.inputBlock}>
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
                            <div className={st.inputErrorMessage}>
                                {errors?.date && <p>{errors?.date?.message}</p>}
                            </div>
                        </div>

                        <div className={st.inputBlock}>
                            <select
                                className={`${st.input} ${st.inputTags}`}
                                placeholder={"Дата публикации"}
                                {...register("type", {
                                    required: "Укажите тип проекта",
                                    minLength: {
                                        value: 1,
                                        message: "Минимум 1 символ"
                                    }
                                })}
                            >
                                <option value={"house"}>Дом</option>
                                <option value={"flat"}>Квартира</option>
                                <option value={"office"}>Офис</option>
                            </select>
                            <div className={st.inputErrorMessage}>
                                {errors?.type && <p>{errors?.type?.message}</p>}
                            </div>
                        </div>
                        {/*<form encType="multipart/form-data" method="post">*/}
                        <input ref={inputFileRef} type={"file"} onChange={loadNewPhoto} multiple name={"imagesArray"} accept="image/jpeg,image/png,image/jpg, image/heic, image/HEIC"/>
                        {/*</form>*/}

                    </div>

                    {(newPhoto.length !== 0 && newPhotoBase64.length !== 0) && (
                        <div className={st.gallery}>
                            {/* идем по названиям фотографий в данных о проекте с сервера */}
                            {[...Array(newPhoto.length)].map((s, id) =>
                                <div className={`${st.photoBlock} ${st.newPhotoBlock}`} key={id}>
                                    <img className={st.photo} src={newPhotoBase64[id]} alt={newPhoto[id].name}/>
                                    <span className={st.fileName}>{newPhoto[id].name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <button className={st.updateButton}>Обновить</button>

                </form>


            </div>
        </div>
    );
};

