import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {logout, selectIsAuth} from "../../redux/slices/auth";
import {Redirect, useParams} from "react-router-dom";
import st from "./EditProject.module.css"
import axios from "../../axios";
import {useForm} from "react-hook-form";
import Loader from "../../components/UI/Loader/Loader";
import {ReactComponent as Close} from "../../image/icons/close.svg";
import {ReactComponent as ChevronLeft} from "../../image/icons/chevron-left.svg";
import {ReactComponent as ChevronRight} from "../../image/icons/chevron-right.svg";
import {translate} from "../../utils/Utils";


export const EditProject = () => {
    const isAuth = useSelector(selectIsAuth)
    const dispatch = useDispatch()
    const id = useParams().id;
    const [projectInfo, setProjectInfo] = useState({})

    //  словарь с фотографиями (словарь, чтобы хранить все фотки в нужном порядке)
    const [arr, setArr] = useState({}) // массив с base64 представлениями фотографий

    // идет ли загрузка данных проекта
    const [isLoading, setIsLoading] = useState(true);

    // состояние для подгрузки очередной картинки
    const [photo, setPhoto] = useState();

    // массив с загруженными админом фотографиями
    const [newPhoto, setNewPhoto] = useState([]);

    const [newPhotoBase64, setNewPhotoBase64] = useState([]);

    const inputFileRef = useRef(null); // сюда мы привяжем поле для загрузки картинок

    // загрузка уже имеющихся данных
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
                    arr[image.name] = res.data
                    // console.log(res.data)

                    setPhoto(photo)
                    setPhoto(res.data)

                    return res.data
                })
            }
            // устанавливаем значения в поля формы
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
            if (projectInfo.photo.indexOf(newFile.name) === -1) {
                projectInfo.photo.push(newFile.name)
            }
        }
        // загружаем фотографии на бэк
        await axios.post(`/image/${projectInfo.name}`, formData)

        // обновляем данные в монгоДБ
        data.date = data.date.split('-').reverse().join('.')
        const answer = await axios.patch(`projects/${id}`, {...projectInfo, ...data, lastName: projectInfo.name});
        projectInfo.name = data.name;
        alert("success: " + answer.data.success);
        window.location.reload();
    }

    const {register, handleSubmit, formState: {errors}, reset, setValue} = useForm({mode: "onBlur"})

    // функция удаления названия фотографии из projectInfo и представления фотографии в base64 из arr
    const removePhoto = (photo) => {
        // console.log(photo)
        if (projectInfo.photo.indexOf(photo) >= 0) {
            projectInfo.photo.splice(projectInfo.photo.indexOf(photo), 1);
            delete arr[photo]
        }
        // console.log(projectInfo.photo)
        // console.log(arr)
        setProjectInfo({...projectInfo, photo: projectInfo.photo})
        setArr(arr)
    }

    const moveProjectPhoto = (s, photo) => {
        const indexPhotoInProjectInfo = projectInfo.photo.indexOf(photo);
        // console.log(s)
        if (s === "right" && projectInfo.photo.length - 1 > indexPhotoInProjectInfo) {
            const buffer = projectInfo.photo[indexPhotoInProjectInfo + 1];
            projectInfo.photo[indexPhotoInProjectInfo + 1] = projectInfo.photo[indexPhotoInProjectInfo];
            projectInfo.photo[indexPhotoInProjectInfo] = buffer;
        }
        if (s === "left" && indexPhotoInProjectInfo > 0) {
            const buffer = projectInfo.photo[indexPhotoInProjectInfo - 1];
            projectInfo.photo[indexPhotoInProjectInfo - 1] = projectInfo.photo[indexPhotoInProjectInfo];
            projectInfo.photo[indexPhotoInProjectInfo] = buffer;
        }

        setProjectInfo({...projectInfo, photo: projectInfo.photo})
    }

    useEffect(() => {
        console.log(projectInfo.preview)
    }, [projectInfo])

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

    const setPreview = (photo) => {
        if (projectInfo.preview.indexOf(photo) >= 0) {
            projectInfo.preview.splice(projectInfo.preview.indexOf(photo), 1);
        } else {
            projectInfo.preview.push(photo);
        }
        setProjectInfo({...projectInfo, preview: projectInfo.preview})
    }

    const removeProject = async () => {
        let result = window.confirm("Вы уверены?");
        if (result) {
            const {data} = await axios.delete(`/projects/${id}`);
            console.log(data)
            alert("success: " + data.success);
            return <Redirect to="/admin/all" />
        }
    }


    useEffect(() => {
        // console.log(projectInfo)
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

                    {!isLoading && (
                        <div className={st.gallery}>
                            {/* идем по названиям фотографий в данных о проекте с сервера */}
                            {projectInfo?.photo.map((p, id) =>
                                <div className={st.photoBlock} key={id}>
                                    {arr[p] ? (
                                            <>
                                                <img className={st.photo} src={arr[p]} alt={projectInfo.photo[id]}/>
                                                <input type={"checkbox"} className={st.checkBox} onChange={() => setPreview(p)} checked={projectInfo.preview.indexOf(p) >= 0}/>
                                                <p className={st.previewNum}>{projectInfo.preview.indexOf(p) >= 0 && projectInfo.preview.indexOf(p) + 1}</p>
                                                <Close className={st.closeButton} id={p} onClick={() => removePhoto(p)}/>
                                                <ChevronLeft className={st.chevronLeft}/>
                                                <div className={st.chevronLeftBlock} onClick={() => moveProjectPhoto('left', p)}></div>
                                                <ChevronRight className={st.chevronRight}/>
                                                <div className={st.chevronRightBlock} onClick={() => moveProjectPhoto('right', p)}></div>
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

                    <button className={st.updateButton}>Обновить</button>

                </form>
                <button className={st.removeButton} onClick={removeProject}>Удалить проект</button>


            </div>
        </div>
    );
};

