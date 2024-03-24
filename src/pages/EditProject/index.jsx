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
import {AddressSuggestions} from "react-dadata";


export const EditProject = () => {
    const dispatch = useDispatch()
    const id = useParams().id;
    const [projectInfo, setProjectInfo] = useState()

    // главный маркдаун текст
    const [text, setText] = useState("");

    //  словарь с ссылками на фотографии
    const [photoUrl, setPhotoUrl] = useState({})

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

    // видно ли проект пользователям
    const [isCompleted, setIsCompleted] = useState(true);
    
    // открыто ли меню координаты
    const [isOpenedCoords, setIsOpenedCoords] = useState(false);
    const [hasCoords, setHasCoords] = useState(false);
    const [address, setAddress] = useState();

    const fetchPhoto = async () => {
        axios.get(`/projects/${id}`).then(res => {
            setProjectInfo(res.data)
            setIsLoading(false)
            setIsVisible(res.data.visible)
            setIsCompleted(res.data.completed)
            for (let i = 0; i < res.data.photos.length; i++) {
                axios.get(`/photos/${res.data.photos[i].id}`, {
                        responseType: 'blob'
                    }).then(response => {
                        // Создаем временный URL из объекта Blob
                        photoUrl[res.data.photos[i].position - 1] = { url: URL.createObjectURL(response.data), ...res.data.photos[i] } ;
                        // Обновляем состояние с новым массивом фотографий
                        setPhotoUrl({ ...photoUrl});
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

            axios.get(`/projects/${id}/coordinates`).then(coordinates => {
                if (coordinates.data !== "") {
                    setHasCoords(true)
                    setValue2('latitude', coordinates.data.latitude, {shouldValidate: true})
                    setValue2('longitude', coordinates.data.longitude, {shouldValidate: true})
                    setValue2('hoverInfo', coordinates.data.hoverInfo, {shouldValidate: true})
                    setValue2('info', coordinates.data.info, {shouldValidate: true})
                    setValue2('id', coordinates.data.id, {shouldValidate: false})
                }
            });
            
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


        const answer = await axios.patch(`projects`, {...projectInfo, ...data, description: text, visible: isVisible, completed: isCompleted},
            {
                params: {
                    id: projectInfo.id
                }
            });
        if(answer.data)
            alert("success");
        // fetchPhoto();
        window.location.reload();
    }

    const onSubmitCoords = async (data) => {
        console.log({...data, projectId: id})
        if (hasCoords) {
            const answer = await axios.patch(`coordinates`, {...data, projectId: id},
                {
                    params: {
                        id: data.id
                    }
                });
            if(answer.data)
                alert("success");
        } else {
            const answer = await axios.post(`coordinates`, {...data, projectId: id});
            if(answer.data) {
                setHasCoords(true)
                alert("success");
            }
        }
        
    }

        const {register, handleSubmit, formState: {errors}, setValue} = useForm({mode: "onBlur"})
    const {
        register: register2,
        formState: {errors: errors2},
        handleSubmit: handleSubmit2,
        setValue: setValue2
    } = useForm({
        mode: "onBlur",
    });
    
    // функция удаления названия фотографии из projectInfo и представления фотографии в base64 из arr
    const removePhoto = async (photo) => {
        try {
            await axios.delete(`/photos`, {
                params: {
                    id: photo.id
                }
            });
        } catch (error) {
            console.log(error.message + ": " + error.response.data.message)
            return
        }
        if (Object.keys(photoUrl).length === 1) {
            delete photoUrl[0];
        } else {
            for (let key of Object.keys(photoUrl)) {
                key = parseInt(key)
                if (key < photo.position - 1) {}
                else if (key >= photo.position - 1) {
                    photoUrl[key + 1].position = key + 1;
                    photoUrl[key] = photoUrl[key + 1]
                }
                if (key === Object.keys(photoUrl).length - 2) {
                    delete photoUrl[key + 1]
                    break
                }
            }
        }
        setPhotoUrl({ ...photoUrl})
    }

    const moveProjectPhoto = async (move, photo) => {
        if (move === "left" && photo.position > 1) {
            try {
                await axios.patch(`/photos/up`, null, {
                    params: {
                        id: photo.id
                    }
                });
            } catch (error) {
                console.log(error.message + ": " + error.response.data.message)
                return
            }

            photoUrl[photo.position - 1] = photoUrl[photo.position - 2] // передвигаем левое фото на место правого
            photoUrl[photo.position - 2] = photo
            photoUrl[photo.position - 1].position = photoUrl[photo.position - 1].position + 1
            photoUrl[photo.position - 2].position = photoUrl[photo.position - 2].position - 1

        }
        if (move === "right" && photo.position < Object.keys(photoUrl).length) {
            try {
                await axios.patch(`/photos/down`, null, {
                    params: {
                        id: photo.id
                    }
                });
            } catch (error) {
                console.log(error.message + ": " + error.response.data.message)
                return
            }
            
            photoUrl[photo.position - 1] = photoUrl[photo.position] // передвигаем правое фото на место левого
            photoUrl[photo.position] = photo
            photoUrl[photo.position - 1].position = photoUrl[photo.position - 1].position - 1
            photoUrl[photo.position].position = photoUrl[photo.position].position + 1

        }
        if (move === "up" && photo.position > 1) {
            try {
                await axios.patch(`/photos/top`, null, {
                    params: {
                        id: photo.id
                    }
                });
            } catch (error) {
                console.log(error.message + ": " + error.response.data.message)
                return
            }
            for (let key of Object.keys(photoUrl).reverse()) {
                key = parseInt(key)
                if (key > photo.position - 1) {}
                else if (key === 0) {
                    photo.position = 1;
                    photoUrl[key] = photo;
                }
                else if (key <= photo.position - 1) {
                    console.log(photoUrl)
                    photoUrl[key - 1].position = key + 1;
                    photoUrl[key] = photoUrl[key - 1]
                }
            }
        }
        setPhotoUrl({ ...photoUrl})

    }

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
        
        photo.preview = !photo.preview;
        
        try {
            await axios.patch(`/photos/${url}`, null, {
                params: {
                    id: photo.id
                }
            });
        } catch (error) {
            console.log(error.message + ": " + error.response.data.message)
            photo.preview = !photo.preview;
            return
        }
        if (url === "previewDown") {
            photoUrl[photo.position - 1].preview = false;
            for (let key of Object.keys(photoUrl)) {
                if (photoUrl[key].preview && photoUrl[key].previewPosition > photo.previewPosition) {
                    photoUrl[key].previewPosition = photoUrl[key].previewPosition - 1;
                }
            }
            photoUrl[photo.position - 1].previewPosition = 0;
        }
        else if (url === "previewRise") {
            photoUrl[photo.position - 1].preview = true;
            photoUrl[photo.position - 1].previewPosition = getMaxPreviewPosition() + 1;
        }
        setPhotoUrl({ ...photoUrl})
    }
    
    const getMaxPreviewPosition = () => {
        let max = 0;
        for (let key of Object.keys(photoUrl)) {
            if (photoUrl[key].previewPosition > max) {
                max = photoUrl[key].previewPosition;
            }
        }
        return max;
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
        setValue2('latitude', address?.data.geo_lat, {shouldValidate: true})
        setValue2('longitude', address?.data.geo_lon, {shouldValidate: true})
    }, [address])

    useEffect(() => {
        // console.log(projectInfo)
    }, [projectInfo])
    return (
        <div>
            <div className={st.container}>
                <span className={st.title}>Редактор проекта</span>
                <form key={1} onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
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
                        <div className={st.visible}>
                            <label htmlFor={"completed"}>Завершен</label>
                            <input type={"checkbox"}
                                   id={"completed"}
                                   checked={isCompleted}
                                   onChange={(e) => setIsCompleted(e.target.checked)}
                            />
                        </div>
                        {/*<form encType="multipart/form-data" method="post">*/}
                            <input ref={inputFileRef} type={"file"} onChange={loadNewPhoto} multiple name={"imagesArray"} accept="image/jpeg,image/png,image/jpg"/>
                        {/*</form>*/}

                    </div>
                    <div className={st.navbar}>
                        <div>
                            <button className={st.updateButton} type={"submit"}>Обновить</button>
                            <button className={st.removeButton} type={"button"} onClick={removeProject}>Удалить проект</button>
                        </div>


                        <button className={st.logout} onClick={onClickLogout}>Выйти</button>
                    </div>

                </form>
                <form key={2} onSubmit={handleSubmit2(onSubmitCoords)}>
                    <div className={st.coordsBlock}>
                        <button className={st.coordsButton} type={"button"} onClick={() => setIsOpenedCoords(!isOpenedCoords)}>Координата</button>
                        {isOpenedCoords &&
                            <>
                                <AddressSuggestions token="aee53cf8a1ec5fde073f6ee75e3db26c2147874c" placeholder="Введите адрес" value={address} onChange={setAddress} />
                                <div className={st.coordsFieldsBlock}>
                                    <div className={st.inputBlock}>
                                        <input
                                            className={`${st.input} ${st.inputTags}`}
                                            type={"text"}
                                            placeholder={"Широта (latitude)"}
                                            {...register2("latitude", {
                                                required: "Укажите широту",
                                                minLength: {
                                                    value: 8,
                                                    message: "Минимум 8 символов"
                                                }
                                            })}
                                        />
                                        <div className={st.inputErrorMessage}>
                                            {errors2?.latitude && <p>{errors2?.latitude?.message}</p>}
                                        </div>
                                    </div>
                                    <div className={st.inputBlock}>
                                        <input
                                            className={`${st.input} ${st.inputTags}`}
                                            type={"text"}
                                            placeholder={"Долгота (longitude)"}
                                            {...register2("longitude", {
                                                required: "Укажите долготу",
                                                minLength: {
                                                    value: 8,
                                                    message: "Минимум 8 символов"
                                                }
                                            })}
                                        />
                                        <div className={st.inputErrorMessage}>
                                            {errors2?.longitude && <p>{errors2?.longitude?.message}</p>}
                                        </div>
                                    </div>
                                    <div className={st.inputBlock}>
                                        <input
                                            className={`${st.input} ${st.inputTags}`}
                                            type={"text"}
                                            placeholder={"Информация при наведении"}
                                            {...register2("hoverInfo", {
                                                required: "Укажите информацию",
                                                minLength: {
                                                    value: 3,
                                                    message: "Минимум 3 символа"
                                                }
                                            })}
                                        />
                                        <div className={st.inputErrorMessage}>
                                            {errors2?.hoverInfo && <p>{errors2?.hoverInfo?.message}</p>}
                                        </div>
                                    </div>
                                    <div className={st.inputBlock}>
                                        <input
                                            className={`${st.input} ${st.inputTags}`}
                                            type={"text"}
                                            placeholder={"Информация при нажатии на метку"}
                                            {...register2("info", {
                                                required: "Укажите информацию",
                                                minLength: {
                                                    value: 3,
                                                    message: "Минимум 3 символа"
                                                }
                                            })}
                                        />
                                        <div className={st.inputErrorMessage}>
                                            {errors2?.info && <p>{errors2?.info?.message}</p>}
                                        </div>
                                    </div>
                                </div>
                                <button className={st.coordsButton} type={"submit"}>Сохранить</button>
                            </>
                        }
                    </div>
                </form>
                {/*{*/}
                {/*    "latitude": "55.773662",*/}
                {/*    "longitude": "37.474336",*/}
                {/*    "hoverInfo": "Велтон",*/}
                {/*    "info": "г. Москва, ул. Народного ополчения, д. 15/2",*/}
                {/*    "projectId": "124d5b7f-a3ef-41df-8732-21528c47ad18"*/}
                {/*}*/}

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
                        {Object.keys(photoUrl).map(( id) =>
                            <div className={st.photoBlock} key={id}>
                                {photoUrl[id] ? (
                                        <>
                                            <img className={st.photo} src={photoUrl[id].url} alt={photoUrl[id].url.name}/>

                                            <input type={"checkbox"} className={st.checkBox} onChange={() => setPreview(photoUrl[id])} checked={photoUrl[id].preview}/>
                                            <p className={st.previewNum}>{photoUrl[id].preview && photoUrl[id].previewPosition}</p>

                                            <Close className={st.closeButton} onClick={() => removePhoto(photoUrl[id])}/>

                                            <ChevronLeft className={st.chevronLeft}/>
                                            <div className={st.chevronLeftBlock} onClick={() => moveProjectPhoto('left', photoUrl[id])}></div>
                                            <ChevronRight className={st.chevronRight}/>
                                            <div className={st.chevronRightBlock} onClick={() => moveProjectPhoto('right', photoUrl[id])}></div>

                                            <div className={st.upArrowBlock} onClick={() => moveProjectPhoto('up', photoUrl[id])}></div>
                                            <ChevronRight className={st.upArrow}/>

                                            <span className={st.fileName}>{photoUrl[id].name}</span>

                                        </>
                                    ) :
                                    (
                                        <>
                                            <Loader width={40}/>
                                            <Close className={st.closeButton} onClick={() => removePhoto(photoUrl[id])}/>
                                        </>

                                    )}

                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

