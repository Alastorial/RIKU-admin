import React, {useEffect, useState} from 'react';
import st from "./Callbacks.module.css";
import axios from "../../axios";
import {Link} from "react-router-dom";

export const Callbacks = () => {

    const [cbInfo, setCbInfo] = useState({});
    // идет ли загрузка данных проекта
    const [isLoading, setIsLoading] = useState(true);

    // загрузка уже имеющихся данных
    useEffect(() => {
        axios.get(`/callBack`).then(res => {
            for (let i = 0; i < res.data.length; i++) {
                cbInfo[i] = res.data[i]
            }
            // setCbInfo(res.data)
            setIsLoading(false)

            // let date = res.data.date.split(".").reverse().join('-');
        });
    }, [])

    useEffect(() => {
        console.log(cbInfo)
        console.log(123)
    }, [cbInfo])

    const changeSolved = async (e) => {
        let id = e.target.id
        console.log(id)
        for (let i = 0; i < Object.values(cbInfo).length; i++) {
            if (cbInfo[i]._id === id) {
                cbInfo[i]["solved"] = e.target.checked;
                setCbInfo({...cbInfo});
                console.log(cbInfo)

                const ans = await axios.patch(`/callBack/${id}`, {...cbInfo, solved: e.target.checked});

                if (ans.data?.success) {
                    alert("Успешно");
                } else {
                    alert(ans.data?.err)
                }
                break;
            }
        }

    }

    const deleteCb = async (e) => {
        let result = window.confirm("Вы уверены?");
        let newInf = {}
        let index = 0;
        let ans;
        if (result) {
            let id = e.target.id
            console.log(id)
            for (let i = 0; i < Object.values(cbInfo).length; i++) {
                if (cbInfo[i]._id === id) {
                    index = 1;
                    ans = await axios.delete(`/callBack/${id}`);

                    if (ans.data?.success) {
                        alert("Успешно");

                    } else {
                        alert(ans.data?.err)
                    }
                } else {
                    newInf[i - index] = cbInfo[i]
                }
            }
            console.log(newInf)
            if (ans.data?.success) {
                setCbInfo({...newInf})
            }

        }

    }


    return (
        <div>
            <div className={st.container}>
                <span className={st.title}>Обратная связь</span>


                {!isLoading && (
                    <div className={st.mainBlock}>
                        {Object.values(cbInfo).map((info, id) =>

                            <div className={st.callBlock} key={info._id}>
                                <div className={st.leftBlock}>
                                    <span>{info.createdAt}</span>
                                    <span>{info.name}</span>
                                    <span>{info.email}</span>
                                    <span>{info.phone}</span>
                                </div>

                                <div className={st.rightBlock}>
                                    <div className={st.buttons}>
                                        <div className={st.checkbox}>
                                            <label htmlFor={info._id}>Обработано</label>
                                            <input type={"checkbox"} id={info._id} onChange={changeSolved} checked={info.solved}/>
                                        </div>
                                        <button className={st.deleteButton} id={info._id} onClick={deleteCb}>Удалить</button>

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

