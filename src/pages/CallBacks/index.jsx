import React, {useEffect, useState} from 'react';
import st from "./Callbacks.module.css";
import axios from "../../axios";

export const Callbacks = () => {

    const [cbInfo, setCbInfo] = useState([]);
    // идет ли загрузка данных проекта
    const [isLoading, setIsLoading] = useState(true);

    // загрузка уже имеющихся данных
    useEffect(() => {
        axios.get(`/callBack`).then(res => {
            // for (let i = 0; i < res.data.length; i++) {
            //     cbInfo[res.data[i]._id] = res.data[i]
            // }
            setCbInfo(res.data)
            console.log(res.data)
            setIsLoading(false)

            // let date = res.data.date.split(".").reverse().join('-');
        });
    }, [])

    useEffect(() => {
        console.log(cbInfo)
    }, [cbInfo])

    const changeSolved = (e) => {
        let id = e.target.id
        console.log(id)
        for (let i = 0; i < cbInfo.length; i++) {
            if (cbInfo[i]._id === id) {
                cbInfo[i]["solved"] = e.target.checked;
                setCbInfo([...cbInfo]);
                break;
            }
        }

    }


    return (
        <div>
            <div className={st.container}>
                <span className={st.title}>Обратная связь</span>


                    {!isLoading && (
                        <div className={st.mainBlock}>
                        {cbInfo.map((info, id) =>

                            <div className={st.callBlock} key={id}>
                                <div className={st.leftBlock}>
                                    <span>{info.createdAt}</span>
                                    <span>{info.name}</span>
                                    <span>{info.email}</span>
                                    <span>{info.phone}</span>
                                </div>
                                <div className={st.rightBlock}>
                                    <label htmlFor={info._id}>Обработано</label>
                                    <input type={"checkbox"} id={info._id} onChange={changeSolved}/>
                                    <span>{info.topic}</span>
                                </div>


                            </div>
                        )}
                        </div>
                    )}

            </div>

        </div>
    );
};

