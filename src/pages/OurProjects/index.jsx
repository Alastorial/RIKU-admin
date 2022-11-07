import React, {useEffect, useState} from 'react';
import st from "./OurProjects.module.css"
import Filter from "../../components/Filter/Filter";
import { MiniProject } from "../../components/UI/MiniProject/MiniProject";
import { useFilterProjects } from "../../hooks/useFilterProjects";
import {useDispatch, useSelector} from "react-redux";
import {logout, selectIsAuth} from "../../redux/slices/auth";
import {Redirect} from "react-router-dom";
import axios from "../../axios";


export const OurProjects = () => {
    const dispatch = useDispatch()
    const isAuth = useSelector(selectIsAuth)


    // дефолтные значения для фильтров на этой странице (передаем как пропсы)
    const [filters, setFilters] = useState({
        flats: false,
        houses: false,
        offices: false,
        oneRoom: false,
        twoRoom: false,
        threeRoom: false,
        fourPlusRoom: false,
        sMin: 1,
        sMax: 200,
        sortBy: "date",
        sortToUp: false
    });

    const onClickLogout = () => {
        if (window.confirm('Вы действительно хотите выйти ?')) {
            dispatch(logout()); // это делается именно так тк данные о пользователе хранятся в store, поэтому
            // logout находится именно там, мы его оттуда импортируем
            window.localStorage.removeItem('token')
        }
    };

    // данные о всех проектах
    const [projectsInfo, setProjectsInfo] = useState([])

    useEffect(() => {
        axios.get("/projects").then(res => {
            setProjectsInfo(res.data)
            // console.log(res.data[0]);
        });
    }, [])

    // здесь идет фильтрация и сортировка
    const sortedProjectsInfo = useFilterProjects(projectsInfo, filters);

    //TODO добавить стрелочку-якорь наверх

    // отключено, тк идет отслеживание состояния шапки и каждый раз новый рандом перерисовывает проекты
    // это используется, чтобы в map всегда отрисовывались посты с новыми ключами и всегда была анимация
    // const random = getRandomInt(9999999);

    if (!isAuth) {
        return <Redirect to="/auth" />
    }

    return (
        <div>
            <button onClick={onClickLogout}>Выйти</button>
            {/*<motion.span custom={5} variants={animation} className={st.ourProjectsText}>НАШИ ПРОЕКТЫ</motion.span>*/}
            <span className={st.ourProjectsText}>ПРОЕКТЫ</span>
            <Filter filters={filters} setFilters={setFilters} projectsInfo={projectsInfo}/>
            {/* галерея, отправляем отсортированные и отфильтрованные словари с информацией о постах(текст, путь до постоянного фона, превью) на каждый минипост */}
            <div className={st.gallery}>
                {sortedProjectsInfo.map((project, id) =>

                    <MiniProject project={project} key={project._id}/>
                )}

                {/*/!* если кол-во видимых постов не равно кол-ву пришедших данных *!/*/}
                {/*{numOfVisPro < sortedProjectsInfo.length &&*/}
                {/*    <button className={st.showMore} onClick={() => setNumOfVisProj(numOfVisPro + 6)}>ПОКАЗАТЬ ЕЩЕ</button>*/}
                {/*}*/}
            </div>

        </div>

    );
};
