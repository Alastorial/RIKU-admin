import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {logout, selectIsAuth} from "../../redux/slices/auth";
import {Redirect, useParams} from "react-router-dom";
import st from "./EditProject.module.css"
import axios from "../../axios";
import {useForm} from "react-hook-form";
import Loader from "../../components/UI/Loader/Loader";
import {ReactComponent as Close} from "../../image/icons/close.svg";


export const Admin = () => {
    const isAuth = useSelector(selectIsAuth)
    const dispatch = useDispatch()
    const id = useParams().id;
    const [projectInfo, setProjectInfo] = useState({})

    //  словарь с фотографиями (словарь, чтобы хранить все фотки в нужном порядке)
    const [arr2, setArr2] = useState({}) // массив с base64 представлениями фотографий

    // идет ли загрузка данных проекта
    const [isLoading, setIsLoading] = useState(true);

    // состояние для подгрузки очередной картинки
    const [photo, setPhoto] = useState();

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


        const files = inputFileRef.current.files;
        for (let key of Object.keys(files)) {
            formData.append('postImage', files[key])
            if (projectInfo.photo.indexOf(files[key].name) === -1) {
                projectInfo.photo.push(files[key].name)
            }
            console.log(projectInfo.photo);
            // console.log(files[key]);
        }




        // const file = inputFileRef.current.files[0];
        // formData.append('postImage', file)
        // console.log(inputFileRef.current.files)
        // const { data2 }  = await axios.post('/image', {title: projectInfo.name, formData}, config)
        await axios.post(`/image/${projectInfo.name}`, formData)
        // console.log({...projectInfo, ...data, lastName: projectInfo.name})
        const answer = await axios.patch(`projects/${id}`, {...projectInfo, ...data, lastName: projectInfo.name});
        projectInfo.name = data.name;
        alert("success: " + answer.data.success);
        window.location.reload();
    }

    const {register, handleSubmit, formState: {errors}, reset, setValue} = useForm({
        mode: "onBlur"
    })

    // этот проект мы получаем с сервера
    useEffect(() => {
        axios.get(`/projects/${id}`).then(res => {
            setProjectInfo(res.data)
            setIsLoading(false)
            for (let i = 0; i < res.data.photo.length; i++) {
                const image = {
                    title: res.data.name,
                    name: res.data.photo[i],
                }
                axios.get(`/image/${image.title}/${image.name}`, image).then(res => {
                    arr2[image.name] = res.data
                    // console.log(res.data)

                    setPhoto(photo)
                    setPhoto(res.data)

                    return res.data
                })
            }
            // console.log(arr2)
            setValue('name', res.data.name, {shouldValidate: true})
            setValue('description', res.data.description, {shouldValidate: true})
            setValue('type', res.data.type, {shouldValidate: true})
            setValue('address', res.data.address, {shouldValidate: true})
            setValue('place', res.data.place, {shouldValidate: true})
            setValue('numberOfRooms', res.data.numberOfRooms, {shouldValidate: true})
            setValue('area', res.data.area, {shouldValidate: true})
            setValue('popular', res.data.popular, {shouldValidate: true})
            let date = res.data.date.split(".").reverse().join('-');
            setValue('date', date, {shouldValidate: true})
        });
    }, [id])

    // функция удаления названия фотографии из projectInfo и представления фотографии в base64 из arr2
    const removePhoto = (e) => {
        console.log(e.target.id)
        if (projectInfo.photo.indexOf(e.target.id) >= 0) {
            projectInfo.photo.splice(projectInfo.photo.indexOf(e.target.id), 1);
            delete arr2[e.target.id]
        }
        console.log(projectInfo.photo)
        console.log(arr2)
        setProjectInfo({...projectInfo, photo: projectInfo.photo})
        setArr2(arr2)
    }


    useEffect(() => {
        console.log(projectInfo)
    }, [projectInfo])

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
                            <input ref={inputFileRef} type={"file"} multiple name={"imagesArray"} accept="image/jpeg,image/png,image/jpg, image/heic, image/HEIC"/>
                        {/*</form>*/}

                    </div>

                    {!isLoading && (
                        <div className={st.gallery}>
                            {projectInfo?.photo.map((p, id) =>
                                <div className={st.photoBlock} key={id}>
                                    {arr2[p] ? (
                                            <>
                                                <img className={st.photo} src={arr2[p]} alt={projectInfo.photo[id]}/>
                                                <Close className={st.closeButton} id={projectInfo.photo[id]} onClick={(e) => removePhoto(e)}/>
                                                <span className={st.fileName}>{projectInfo.photo[id]}</span>

                                            </>
                                        ) :
                                        (
                                            <Loader width={40}/>
                                        )}

                                </div>
                            )}
                        </div>
                    )}

                    <button>Обновить</button>

                </form>


            </div>
        </div>
    );
};

