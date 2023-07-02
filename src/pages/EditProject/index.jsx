import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from "react-redux";
import {logout} from "../../redux/slices/auth";
import {Redirect, useParams} from "react-router-dom";
import st from "./EditProject.module.css"
import axios from "../../axios";
import {useForm} from "react-hook-form";
import Loader from "../../components/UI/Loader/Loader";
import {ReactComponent as Close} from "../../image/icons/close.svg";
import {ReactComponent as ChevronLeft} from "../../image/icons/chevron-left.svg";
import {ReactComponent as ChevronRight} from "../../image/icons/chevron-right.svg";
import {translate} from "../../utils/Utils";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";


export const EditProject = () => {
    const dispatch = useDispatch()
    const id = useParams().id;
    const [projectInfo, setProjectInfo] = useState()

    // главный маркдаун текст
    const [text, setText] = useState("");

    //  словарь с фотографиями (словарь, чтобы хранить все фотки в нужном порядке)
    const [arr, setArr] = useState({}) // массив с base64 представлениями фотографий

    // идет ли загрузка данных проекта
    const [isLoading, setIsLoading] = useState(true);

    // состояние для подгрузки очередной картинки
    const [photo, setPhoto] = useState();

    // массив с загруженными админом фотографиями
    const [newPhoto, setNewPhoto] = useState([]);

    const [newPhotoBase64, setNewPhotoBase64] = useState([]);

    // массив с именами загруженных фото для превью
    const [newPhotoPreview, setNewPhotoPreview] = useState([]);

    const inputFileRef = useRef(null); // сюда мы привяжем поле для загрузки картинок

    // видно ли проект пользователям
    const [isVisible, setIsVisible] = useState(false);

    const fetchPhoto = async () => {
        axios.get(`/projects/${id}`).then(res => {
            setProjectInfo(res.data)
            setIsLoading(false)
            setIsVisible(res.data.visible)
            for (let i = 0; i < res.data.photosId.length; i++) {
                axios.get(`/photos/${res.data.photosId[i]}`).then(res => {
                    arr[res.data.position - 1] = res.data
                    setArr({ ...arr})
                    return res.data
                })
            }
            setText(res.data.description)
            // устанавливаем значения в поля формы
            setValue('name', res.data.name, {shouldValidate: true})
            setValue('description', res.data.description, {shouldValidate: true})
            setValue('type', res.data.type, {shouldValidate: true})
            setValue('address', res.data.address, {shouldValidate: true})
            setValue('place', res.data.place, {shouldValidate: true})
            setValue('numberOfRooms', res.data.numberOfRooms, {shouldValidate: true})
            setValue('area', res.data.area, {shouldValidate: true})
            setValue('popular', res.data.popular, {shouldValidate: true})
            setValue('visible', res.data.visible)
            let date = res.data.date.split(".").reverse().join('-');
            setValue('date', date, {shouldValidate: true})
        });
    }

    // загрузка уже имеющихся данных
    useEffect(() => {

        fetchPhoto();

    }, [id])

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
        // получаем загруженные файлы
        const files = inputFileRef.current.files;
        let photos = [];
        //
        // //добавляем их в formData
        for (let key of Object.keys(files)) {
            let photo = {
                preview: false
            }
            photo.name = translate(files[key].name);
            await fileToBase64(files[key]).then(result => {
                photo.base64 = result;
            });
            photo.projectId = projectInfo.id;
            photos.push(photo)
        }
        // загружаем фотографии на бэк
        if (photos.length > 0)
            await axios.post(`/photos/many`, photos)


        const answer = await axios.patch(`projects`, {...projectInfo, ...data, description: text, visible: isVisible},
            {
                params: {
                    id: projectInfo.id
                }
            });
        if(answer.data)
            alert("success");
        fetchPhoto();
        // window.location.reload();
    }

    const {register, handleSubmit, formState: {errors}, setValue} = useForm({mode: "onBlur"})

    // функция удаления названия фотографии из projectInfo и представления фотографии в base64 из arr
    const removePhoto = async (photo) => {
        await axios.delete(`/photos`, {
            params: {
                id: photo.id
            }
        });

        fetchPhoto();
    }

    const moveProjectPhoto = async (move, photo) => {
        if (move === "left" && photo.position > 1) {
            await axios.patch(`/photos/up`, null, {
                params: {
                    id: photo.id
                }
            });

            arr[photo.position - 1] = arr[photo.position - 2] // передвигаем левое фото на место правого
            arr[photo.position - 2] = photo
            arr[photo.position - 1].position = arr[photo.position - 1].position + 1
            arr[photo.position - 2].position = arr[photo.position - 2].position - 1

        }
        if (move === "right" && photo.position < Object.keys(arr).length) {
            await axios.patch(`/photos/down`, null, {
                params: {
                    id: photo.id
                }
            });

            arr[photo.position - 1] = arr[photo.position] // передвигаем правое фото на место левого
            arr[photo.position] = photo
            arr[photo.position - 1].position = arr[photo.position - 1].position - 1
            arr[photo.position].position = arr[photo.position].position + 1

        }
        if (move === "up" && photo.position > 1) {
            await axios.patch(`/photos/top`, null, {
                params: {
                    id: photo.id
                }
            });
        }
        fetchPhoto();
        setArr({ ...arr})

    }

    // useEffect(() => {
    // }, [projectInfo])

    // функция пихает новые фотки в массив для отображения перед отправкой
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

    const setPreview = async (photo) => {
        let url;
        if (photo.preview)
            url = "previewDown";
        else
            url = "previewRise"

        await axios.patch(`/photos/${url}`, null, {
            params: {
                id: photo.id
            }
        });
        fetchPhoto();
    }

    const setNewPreview = (photo) => {
        if (newPhotoPreview.indexOf(photo) >= 0) {
            // newPhotoPreview.splice(newPhotoPreview.indexOf(photo), 1);
            setNewPhotoPreview(newPhotoPreview.filter((e) => e !== photo))
        } else {
            setNewPhotoPreview([...newPhotoPreview, photo])
        }
    }

    const removeProject = async () => {
        let result = window.confirm("Вы уверены?");
        if (result) {
            const {data} = await axios.delete(`/projects`, {
                params: {
                    id: id
                }
            });
            if(data)
                alert("success");
            return <Redirect to="/admin/all" />
        }
    }

    // использование useCallback - необходимо для SimpleMDE
    const onChange = React.useCallback((value) => {
        setText(value);
    }, []);


    const onChangeVisible = (value) => {
        setIsVisible(value.target.checked);
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

    useEffect(() => {
        // console.log(projectInfo)
    }, [projectInfo])

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
                            <div className={st.visible}>
                                <label htmlFor={"visible"}>Виден</label>
                                <input type={"checkbox"}
                                       id={"visible"}
                                       checked={isVisible}
                                       onChange={(e) => setIsVisible(e.target.checked)}

                                />
                            </div>
                        {/*<form encType="multipart/form-data" method="post">*/}
                            <input ref={inputFileRef} type={"file"} onChange={loadNewPhoto} multiple name={"imagesArray"} accept="image/jpeg,image/png,image/jpg"/>
                        {/*</form>*/}

                    </div>

                    {(newPhoto.length !== 0 && newPhotoBase64.length !== 0) && (
                        <div className={st.gallery}>
                            {/* идем по названиям фотографий в данных о проекте с сервера */}
                            {[...Array(newPhoto.length)].map((s, id) =>
                                <div className={`${st.photoBlock} ${st.newPhotoBlock}`} key={id}>
                                    <img className={st.photo} src={newPhotoBase64[id]} alt={newPhoto[id].name}/>
                                    <input type={"checkbox"} className={st.checkBox} onChange={() => setNewPreview(newPhoto[id].name)} checked={newPhotoPreview.indexOf(newPhoto[id].name) >= 0}/>
                                    <p className={st.previewNum}>{newPhotoPreview.indexOf(newPhoto[id].name) >= 0 && newPhotoPreview.indexOf(newPhoto[id].name) + 1}</p>
                                    <span className={st.fileName}>{newPhoto[id].name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {!isLoading && (
                        <div className={st.gallery}>
                            {/* идем по названиям фотографий в данных о проекте с сервера */}
                            {projectInfo?.photosId.map((p, id) =>
                                <div className={st.photoBlock} key={id}>
                                    {arr[id] ? (
                                            <>
                                                <img className={st.photo} src={arr[id].base64} alt={arr[id].name}/>

                                                <input type={"checkbox"} className={st.checkBox} onChange={() => setPreview(arr[id])} checked={arr[id].preview}/>
                                                <p className={st.previewNum}>{arr[id].preview && arr[id].previewPosition}</p>

                                                <Close className={st.closeButton} onClick={() => removePhoto(arr[id])}/>

                                                <ChevronLeft className={st.chevronLeft}/>
                                                <div className={st.chevronLeftBlock} onClick={() => moveProjectPhoto('left', arr[id])}></div>
                                                <ChevronRight className={st.chevronRight}/>
                                                <div className={st.chevronRightBlock} onClick={() => moveProjectPhoto('right', arr[id])}></div>

                                                <div className={st.upArrowBlock} onClick={() => moveProjectPhoto('up', arr[id])}></div>
                                                <ChevronRight className={st.upArrow}/>

                                                <span className={st.fileName}>{arr[id].name}</span>

                                            </>
                                        ) :
                                        (
                                            <Loader width={40}/>
                                        )}

                                </div>
                            )}
                        </div>
                    )}

                    <div className={st.navbar}>
                        <div>
                            <button className={st.updateButton} type={"submit"}>Обновить</button>
                            <button className={st.removeButton} type={"button"} onClick={removeProject}>Удалить проект</button>
                        </div>


                        <button className={st.logout} onClick={onClickLogout}>Выйти</button>
                    </div>

                </form>


            </div>
        </div>
    );
};

