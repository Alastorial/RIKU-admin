import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import st from './MiniProject.module.css';
import {ReactComponent as Area} from "../../../image/icons/area.svg";
import {ReactComponent as Calendar} from "../../../image/icons/calendar.svg";
import {ReactComponent as Eye} from "../../../image/icons/eye.svg";
import MiniProjectLine from "../MiniProjectLine/MiniProjectLine";
import {Link} from "react-router-dom";
import axios from "../../../axios";
import Loader from "../Loader/Loader";

export const MiniProject = ({project}) => {

    // текущее фото
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);



    //  словарь с ссылками на фотографии
    const [photoUrl, setPhotoUrl] = useState({})

    // нужно, чтобы один раз загрузить
    // не использовал useEffect тк он ругается на отсутствие зависимостей


    // получаем картинки для мини проекта
    useEffect(() => {
        const controller = new AbortController();
        const fetchPhoto = async () => {
            if (project && project.photos) { // Проверяем существование project и photos
                for (let i = 0; i < project.photos.length; i++) {
                    axios
                        .get(`/photos/${project.photos[i].id}`, {
                            signal: controller.signal,
                            responseType: 'blob'
                        })
                        .then((response) => {
                            
                            // Создаем временный URL из объекта Blob
                            photoUrl[project.photos[i].previewPosition - 1] = URL.createObjectURL(response.data);

                            // Обновляем состояние с новым массивом фотографий
                            setPhotoUrl({ ...photoUrl});
                        });
                }
            }
        }
        fetchPhoto();
        return () => {
            controller.abort();
        };
    }, [])



    // метод изменения фотографии сзади при ведении мышкой
    const setBackgroundPhoto = (id) => {
        setCurrentPhotoIndex(id)
    }


    // анимация
    const animation = {
        hidden: {
            opacity: 0,
        },
        visible: custom => ({
            opacity: 1,
            transition: {
                delay: custom * 0.1,
            },
        }),
    }

    //TODO плавно сменять картинку

    // при изменении currentPhotoIndex будет изменяться бэкграунд проекта
    return (
        <motion.div initial="hidden" whileInView="visible" custom={2} viewport={{amount: 0, once: true}}
                    variants={animation} className={st.frame}
                    onMouseLeave={() => setCurrentPhotoIndex(0)}>
            <Link to={`/admin/${project.id}`}>
                <div className={st.project}>
                    {photoUrl[currentPhotoIndex] ?
                        <>
                            <img src={photoUrl[currentPhotoIndex]} alt={"miniPhoto"} className={st.projectPhoto}/>
                            <span>{project.name}</span>
                        </>
                        :
                        <Loader width={60}/>
                    }

                </div>
                <div className={st.params}>
                    <div className={st.param}>
                        <Area width={21}/>
                        <span>{project.area + "м²"}</span>
                    </div>
                    <div className={st.param}>
                        <Calendar width={20}/>
                        <span>{project.date.split('-').reverse().join('.')}</span>
                    </div>
                    <div className={st.param}>
                        <Eye width={20}/>
                        <span>{project.popular}</span>
                    </div>
                </div>
                <div className={st.lineBoxes}>
                    {project.photos.map((i, id) =>
                        <MiniProjectLine key={id} id={id} onMove={setBackgroundPhoto}
                                         numOfLines={project.photos.length}/>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};
// export const MMiniProject = motion(MiniProject);
