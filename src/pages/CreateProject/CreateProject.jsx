import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import SimpleMDE from "react-simplemde-editor";


export const CreateProject = () => {
    const dispatch = useDispatch()

    // главный маркдаун текст
    const [text, setText] = useState("");

    const [photo, setPhoto] = useState([])

    // массив с загруженными админом фотографиями
    const [newPhoto, setNewPhoto] = useState([]);

    // массив с именами загруженных фото для превью
    const [newPhotoPreview, setNewPhotoPreview] = useState([]);

    // массив с base64 представлениями загруженных фоток
    const [newPhotoBase64, setNewPhotoBase64] = useState([]);

    // видно ли проект пользователям
    const [isVisible, setIsVisible] = useState(true);
    
    // завершен ли проект
    const [isCompleted, setIsCompleted] = useState(false);

    // ссылка на элемент вставки фотографий
    const inputFileRef = useRef(null); // сюда мы привяжем поле для загрузки картинок

    const onClickLogout = () => {
        if (window.confirm('Вы действительно хотите выйти ?')) {
            dispatch(logout()); // это делается именно так тк данные о пользователе хранятся в store, поэтому
            // logout находится именно там, мы его оттуда импортируем
            window.localStorage.removeItem('token')
        }
    };

    // Convert file to base64 string
    const fileToBase64 = (file) => {
        return new Promise(resolve => {
            var reader = new FileReader();
            // Read file content on file loaded event
            reader.onload = function(event) {
                resolve(event.target.result);
            };

            // Convert data to base64
            reader.readAsDataURL(file);
        });
    };

    const onSubmit = async (data) => {
        const answer = await axios.post(`projects`, {
            ...data,
            visible: isVisible,
            completed: isCompleted,
            description: text ? text : "",
            popular: 1,
            area: Number(data.area),
            numberOfRooms: Number(data.numberOfRooms)
        });

        // получаем загруженные файлы
        const files = inputFileRef.current.files;
        let photos = [];
        // //добавляем их в formData
        for (let key of Object.keys(files)) {
            let photo = {
                preview: false
            }
            photo.name = translate(files[key].name);
            await fileToBase64(files[key]).then(result => {
                photo.base64 = result;
            });
            if (newPhotoPreview.indexOf(photo.name) !== -1)
                photo.preview = true
            photo.projectId = answer.data.id;
            photos.push(photo)
        }
        // загружаем фотографии на бэк
        if (photos.length > 0)
            await axios.post(`/photos/many`, photos)


        if(answer.data)
            alert("success");
        

    }

    const {register, handleSubmit, formState: {errors}, reset, setValue} = useForm({mode: "onBlur"})

    function loadNewPhoto() {
        newPhotoBase64.length = 0
        setNewPhotoBase64(newPhotoBase64)
        setNewPhotoPreview([])

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

    const setNewPreview = (photo) => {
        if (newPhotoPreview.indexOf(photo) >= 0) {
            // newPhotoPreview.splice(newPhotoPreview.indexOf(photo), 1);
            setNewPhotoPreview(newPhotoPreview.filter((e) => e !== photo))
        } else {
            setNewPhotoPreview([...newPhotoPreview, photo])
        }
    }

    // настройки SimpleMDE тоже нужно оборачивать в useMemo
    const options = useMemo(
        () => ({
            spellChecker: false,
            maxHeight: "600px",
            autofocus: true,
            placeholder: "Введите текст...",
            autosave: {
                enabled: true,
                uniqueId: "demo",
                delay: 0,
            },
        }),
        []
    );

    // использование useCallback - необходимо для SimpleMDE
    const onChange = React.useCallback((value) => {
        setText(value);
    }, []);

    // useEffect(() => {
    // }, [newPhotoPreview])

    return (
        <div>
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

                    <SimpleMDE
                        options={options}
                        id="demo"
                        value={text}
                        onChange={onChange}
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
                        <div className={st.checkbox}>
                            <label htmlFor={"visible"}>Виден</label>
                            <input type={"checkbox"}
                                   id={"visible"}
                                   checked={isVisible}
                                   onChange={(e) => setIsVisible(e.target.checked)}
                            />
                        </div>
                        <div className={st.checkbox}>
                            <label htmlFor={"checkbox"}>Завершен</label>
                            <input type={"checkbox"}
                                   id={"checkbox"}
                                   checked={isCompleted}
                                   onChange={(e) => setIsCompleted(e.target.checked)}
                            />
                        </div>
                        {/*<form encType="multipart/form-data" method="post">*/}
                        <input ref={inputFileRef} type={"file"} onChange={loadNewPhoto} multiple name={"imagesArray"}
                               accept="image/jpeg,image/png,image/jpg, image/heic, image/HEIC"/>
                        {/*</form>*/}

                    </div>

                    {(newPhoto.length !== 0 && newPhotoBase64.length !== 0) && (
                        <div className={st.gallery}>
                            {/* идем по названиям фотографий в данных о проекте с сервера */}
                            {[...Array(newPhoto.length)].map((p, id) =>
                                <div className={`${st.photoBlock} ${st.newPhotoBlock}`} key={id}>
                                    <img className={st.photo} src={newPhotoBase64[id]} alt={newPhoto[id].name}/>
                                    <input type={"checkbox"} className={st.checkBox}
                                           onChange={() => setNewPreview(newPhoto[id].name)}
                                           checked={newPhotoPreview.indexOf(newPhoto[id].name) >= 0}/>
                                     <p className={st.previewNum}>{newPhotoPreview.indexOf(newPhoto[id].name) >= 0 && newPhotoPreview.indexOf(newPhoto[id].name) + 1}</p>
                                    <span className={st.fileName}>{newPhoto[id].name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={st.navbar}>
                        <button className={st.updateButton} type={"submit"}>Создать</button>
                        <button className={st.logout} onClick={onClickLogout}>Выйти</button>
                    </div>

                </form>


            </div>
        </div>
    );
};

