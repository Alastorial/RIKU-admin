import React, {useEffect, useState} from 'react';
import st from "./Callbacks.module.css";
import axios from "../../axios";
import {Link} from "react-router-dom";

export const Callbacks = () => {

    let [cbInfo, setCbInfo] = useState([]);
    // идет ли загрузка данных проекта
    const [isLoading, setIsLoading] = useState(true);

    const fetchCallBacks = async () => {
        cbInfo.length = 0
        setCbInfo([...cbInfo])

        axios.get(`/callbacks`).then(res => {
            for (let i = 0; i < res.data.length; i++) {
                cbInfo.push(res.data[i])
            }
            // setCbInfo(res.data)
            setIsLoading(false)
            cbInfo = cbInfo.sort((cb1, cb2) => {
                return new Date(cb1.createdAt) - new Date(cb2.createdAt);
            });

            setCbInfo([...cbInfo])

            // let date = res.data.date.split(".").reverse().join('-');
        });
    }

    // загрузка уже имеющихся данных
    useEffect(() => {
        fetchCallBacks();
    }, [])

    useEffect(() => {
    }, [cbInfo])

    const changeSolved = async (cb) => {
        cb.solved = !cb.solved
        await axios.patch(`callbacks`, {...cb},
            {
                params: {
                    id: cb.id
                }
            });
        fetchCallBacks();

    }

    const deleteCb = async (cb) => {
        window.confirm("Вы уверены?");
        await axios.delete(`callbacks`,
            {
                params: {
                    id: cb.id
                }
            });
        fetchCallBacks();

    }


    return (
        <div>
            <div className={st.container}>
                <span className={st.title}>Обратная связь</span>


                {!isLoading && (
                    <div className={st.mainBlock}>
                        {cbInfo.map((info, id) =>

                            <div className={st.callBlock} key={info.id}>
                                <div className={st.leftBlock}>
                                    <span>{info.createdAt}</span>
                                    <span>{info.name}</span>
                                    <span>{info.email}</span>
                                    <span>{info.phoneNumber}</span>
                                </div>

                                <div className={st.rightBlock}>
                                    <div className={st.buttons}>
                                        <div className={st.checkbox}>
                                            <label htmlFor={info.id}>Обработано</label>
                                            <input type={"checkbox"} id={info.id} onChange={() => changeSolved(info)} checked={info.solved}/>
                                        </div>
                                        <button className={st.deleteButton} id={info.id} onClick={() => deleteCb(info)}>Удалить</button>

                                    </div>
                                    <span>{info.topic}</span>
                                </div>


                            </div>
                        )}
                    </div>
                )}
                <div className={st.navbar}>
                    <Link className={st.back} to={"/admin/all"}>Назад</Link>
                </div>
            </div>

        </div>
    );
};

