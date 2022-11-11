import React, {useState} from 'react';
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


    // состояние для подгрузки очередной картинки
    const [photo, setPhoto] = useState();

    //  словарь с base64 представлениями фотографий (словарь, чтобы хранить все фотки в нужном порядке)
    const [arr2] = useState({}) // массив с base64 представлениями фотографий

    // нужно, чтобы один раз загрузить
    // не использовал useEffect тк он ругается на отсутствие зависимостей
    // получаем картинки для мини проекта
    const [load, setLoad] = useState(true);

    if (load) {
        // console.log(234234)
        for (let i = 0; i < project.preview.length; i++) {
            const image = {
                title: project.name,
                name: project.preview[i],
            }
            axios.get(`/image/${image.title}/${image.name}`, image).then(res => {
                if (i === 0) setCurrentPhoto(res.data)
                setPhoto(photo)
                setPhoto(res.data)
                arr2[i] = res.data;
                return res.data
            })
        }
        setLoad(false)
    }

    // метод изменения фотографии сзади при ведении мышкой
    const setBackgroundPhoto = (id) => {
        setCurrentPhoto(arr2[id])
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
                    onMouseLeave={() => setCurrentPhoto(arr2[0])}>
            <Link to={`/admin/${project._id}`}>
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
                        <span>{project.date}</span>
                    </div>
                    <div className={st.param}>
                        <Eye width={20}/>
                        <span>{project.popular}</span>
                    </div>
                </div>
                <div className={st.lineBoxes}>
                    {project.preview.map((i, id) =>
                        <MiniProjectLine key={id} id={id} onMove={setBackgroundPhoto}
                                         numOfLines={project.preview.length}/>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};
// export const MMiniProject = motion(MiniProject);
