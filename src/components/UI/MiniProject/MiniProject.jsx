import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import st from './MiniProject.module.css';
import {ReactComponent as Area} from "../../../image/icons/area.svg";
import {ReactComponent as Calendar} from "../../../image/icons/calendar.svg";
import {ReactComponent as Eye} from "../../../image/icons/eye.svg";
import MiniProjectLine from "../MiniProjectLine/MiniProjectLine";
import {Link} from "react-router-dom";
import axios from "../../../axios";

export const MiniProject = ({custom, project}) => {

    // текущее фото
    const [currentPhoto, setCurrentPhoto] = useState();


    // const imageUrls = useFetchPhoto(project);

    const [arr, setArr] = useState([])

    useEffect(() => {
        let index = 0;



        for (let i = 0; i < project.preview.length; i++) {
            const image = {
                title: project.name,
                name: project.preview[i],
            }
            arr.push(axios.get(`/image/${image.title}/${image.name}`, image).then(res => {
                // console.log(res)
                // setCurrentPhoto(res.data)
                // setImageUrl(res.data)
                return res.data
            }))
            // arr1[i] = arr[i]
        }

        // устанавливаем базовое значение для проекта
        arr[0].then( data => {
            setCurrentPhoto(data)
            // console.log(data)
        })


        console.log(arr)


    }, [])

    // метод изменения фотографии сзади при ведении мышкой
    const setBackgroundPhoto = (id) => {
        // const imageUrl1 = require(`../../../image/gallery/${project.preview[id]}`);
        // // console.log(imageUrls)
        // setCurrentPhoto(imageUrl1);
        arr[id].then( data => {
            setCurrentPhoto(data)
            // console.log(data)
        })
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
                    onMouseLeave={() => setCurrentPhoto(arr[0].then( data => setCurrentPhoto(data)))}>
            <Link to={`/admin/${project._id}`}>
                <div className={st.project}>
                    <img src={currentPhoto} alt={"miniPhoto"} className={st.projectPhoto}/>
                    <span>{project.name}</span>
                </div>
                {/*<div className={st.project} style={{backgroundImage: `url(${currentPhoto})`, backgroundRepeat:"no-repeat"}} >*/}
                {/*    <span>{project.name}</span>*/}
                {/*</div>*/}
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
