import React, {useEffect, useState} from 'react';
import st from "./Filter.module.css";
import {ReactComponent as Arrow} from "../../image/chevron.svg";
import cn from "classnames";
import {ReactComponent as U} from "../../image/U.svg";
import {Slider, Typography} from "@mui/material";
import SortButton from "../UI/SortButton/SortButton";
import MyCheckbox from "../UI/MyCheckbox/MyCheckbox";
import {Link} from "react-router-dom";

const Filter = ({ filters, setFilters, projectsInfo }) => {
    // const { filters, setFilters } = useContext(FilterDataContext);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchedProjects, setSearchedProjects] = useState([]);

    // функция для поля поиска проекта
    const searchProjects = (e) => {
        let arr = [];
        if (e.target.value !== "") {
            projectsInfo.forEach((p) => {
                if (p.name.toLowerCase().includes(e.target.value.toLowerCase())) {
                    arr.push(p);
                }
            })
            setSearchedProjects(arr);
        } else {
            setSearchedProjects([]);
        }
    }

    useEffect(() => {
    }, [searchedProjects])

    // функция обновления данных фильтра
    const updateFilter = (e) => {
        const newFilters = {}; // создаем новый словарь, чтобы сработал useEffect на главное странице
        if (e.target.type === "checkbox") {
            filters[e.target.id] = e.target.checked;  // обнволяем значение у полученных фильтров
        } else if (e.target.name === "slider") {
            filters["sMax"] = e.target.value[1];  // обнволяем значение у полученных фильтров
            filters["sMin"] = e.target.value[0];  // обнволяем значение у полученных фильтров
        }
        // если клик произошел по кнопке сортировки, то обрабатываем случаи, когда нажали на родительский/дочерний элемент
        else if (e.target.name === "sortButton") {
            if (filters["sortBy"] === e.target.id) {
                filters.sortToUp = !filters.sortToUp;
            } else {
                filters["sortBy"] = e.target.id;
            }
        } else if (e.target.parentElement.name === "sortButton") {
            if (filters["sortBy"] === e.target.parentElement.id) {
                filters.sortToUp = !filters.sortToUp;
            } else {
                filters["sortBy"] = e.target.parentElement.id;
            }
        }

        for (const key in filters) { // копируем
            newFilters[key] = filters[key];
        }

        setFilters(newFilters); // сетим
    }




    return (
        <div>
            <div className={st.container}>
                <div className={st.showFilters}>
                    <button id="showButton" onClick={() => setIsFilterOpen(!isFilterOpen)}>Показать фильтры</button>
                    <label htmlFor="showButton">
                        <Arrow className={cn(st.arrow, {[st.arrowOpened]: isFilterOpen})} width="25"/>
                    </label>
                </div>
            </div>
            <section>
                <hr/>  {/* сам блок фильтров */}
                <div className={cn(st.filtersClosed, {[st.filtersOpened]: isFilterOpen})}> {/* если фильтры не открыты, то навешиваем класс закрытых фильтров */}
                    <div className={st.container}>
                        <div className={st.filtersAndIm}>
                            <div className={st.types}>
                                <div className={st.typesOfWorkPlace}>
                                    <MyCheckbox filters={filters} onChange={updateFilter} id="flats" name="Квартиры" text={"Квартиры"}/>
                                    <MyCheckbox filters={filters} onChange={updateFilter} id="houses" name="Дома" text={"Дома"}/>
                                    <MyCheckbox filters={filters} onChange={updateFilter} id="offices" name="Офисы" text={"Офисы"}/>
                                </div>
                                <div className={st.numberOfRooms}>
                                    <MyCheckbox filters={filters} onChange={updateFilter} id="oneRoom" name="1 комната" text={"1 комната"}/>
                                    <MyCheckbox filters={filters} onChange={updateFilter} id="twoRoom" name="2 комнаты" text={"2 комнаты"}/>
                                    <MyCheckbox filters={filters} onChange={updateFilter} id="threeRoom" name="3 комнаты" text={"3 комнаты"}/>
                                    <MyCheckbox filters={filters} onChange={updateFilter} id="fourPlusRoom" name="4 и более комнат" text={"4 и более комнат"}/>
                                </div>
                            </div>
                            <U className={st.logoU}/>
                        </div>
                        <div className={st.slider}>
                            <Typography id="slider" gutterBottom>
                                {filters["sMin"] === 1 && filters["sMax"] === 550 ?
                                    "Площадь: любая"
                                    : "Площадь: от " + filters["sMin"] + ' м² до ' + filters["sMax"] + " м²"

                                }

                            </Typography>
                            <div className={st.sliderBox}>

                                <Slider
                                    // getAriaLabel={() => 'Temperature range'}  // тип слайдера
                                    id="slider2"
                                    aria-labelledby="slider"
                                    value={[filters["sMin"], filters["sMax"]]}
                                    name="slider"
                                    onChange={updateFilter}
                                    // valueLabelDisplay="auto"  // подсвечивание значения свапа
                                    min={1}
                                    max={550}


                                    disableSwap // отключил свап тоглов
                                    // getAriaValueText={valuetext}

                                    sx ={{
                                        margin: "15px 0px 0px 0px",
                                        padding: 0,
                                        color: '#A7BCDB',
                                        height: 8,
                                        '& .MuiSlider-thumb': {
                                            height: 24,
                                            width: 24,
                                            backgroundColor: '#DEE6F1',
                                            border: '4px solid #A7BCDB',
                                            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                                                boxShadow: 'inherit',
                                            },
                                            '&:before': {
                                                display: 'none',
                                            },
                                        },

                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </div>
                <div className={st.container}>
                    <div className={st.sort}>
                        <div className={st.sortBlock}>
                            <span className={st.sortByText}>Сортировать по:</span>
                            <SortButton id={"date"} text={"Дате"} updateFilter={updateFilter} filters={filters}/>
                            <SortButton id={"area"} text={"Площади"} updateFilter={updateFilter} filters={filters}/>
                            <SortButton id={"popular"} text={"Популярности"} updateFilter={updateFilter} filters={filters}/>
                        </div>
                        <div className={st.searchBlock}>
                            <input type={"text"} className={st.search} onChange={searchProjects} placeholder={"Поиск по проектам..."}/>
                            <div className={st.searchList}>
                                {searchedProjects.map((project) =>
                                    <Link to={`/projects/${project.id}`}>
                                        <div className={st.searchItem} key={project.id}>
                                            <span>{project.name}</span>
                                            <span>{project.date}</span>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Filter;