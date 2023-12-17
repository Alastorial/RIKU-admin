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
    const [currentPhoto, setCurrentPhoto] = useState();



    //  словарь с base64 представлениями фотографий (словарь, чтобы хранить все фотки в нужном порядке)
    const [photoBase64, setPhotoBase64] = useState({}) // массив с base64 представлениями фотографий

    // нужно, чтобы один раз загрузить
    // не использовал useEffect тк он ругается на отсутствие зависимостей


    // получаем картинки для мини проекта
    useEffect(() => {
        const controller = new AbortController();
        const fetchPhoto = async () => {
            if (project && project.photosId) { // Проверяем существование project и photosId
                for (let i = 0; i < project.photosId.length; i++) {
                    axios
                        .get(`/photos/${project.photosId[i]}`, {
                            signal: controller.signal
                        })
                        .then(({ data }) => {
                            photoBase64[data.previewPosition - 1] = data.base64;
                            setPhotoBase64({ ...photoBase64 });
                            if (data.previewPosition - 1 === 0) setCurrentPhoto(data.base64);
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
        setCurrentPhoto(photoBase64[id])
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

    // при изменении currentPhoto будет изменяться бэкграунд проекта
    return (
        <motion.div initial="hidden" whileInView="visible" custom={2} viewport={{amount: 0, once: true}}
                    variants={animation} className={st.frame}
                    onMouseLeave={() => setCurrentPhoto(photoBase64[0])}>
            <Link to={`/admin/${project.id}`}>
                <div className={st.project}>
                    {currentPhoto ?
                        <>
                            <img src={currentPhoto} alt={"miniPhoto"} className={st.projectPhoto}/>
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
                    {project.photosId.map((i, id) =>
                        <MiniProjectLine key={id} id={id} onMove={setBackgroundPhoto}
                                         numOfLines={project.photosId.length}/>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};
// export const MMiniProject = motion(MiniProject);
