import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {logout, selectIsAuth} from "../../redux/slices/auth";
import {Redirect} from "react-router-dom";

export const Admin = () => {
    const isAuth = useSelector(selectIsAuth)
    const dispatch = useDispatch()
    // console.log(isAuth)


    const onClickLogout = () => {
        if (window.confirm('Вы действительно хотите выйти ?')) {
            dispatch(logout()); // это делается именно так тк данные о пользователе хранятся в store, поэтому
            // logout находится именно там, мы его оттуда импортируем
            window.localStorage.removeItem('token')
        }
    };

    if (!isAuth) {
        return <Redirect to="/auth" />
    }
    return (
        <div>
            <h1>sdsdfsdffds</h1>
            <button onClick={onClickLogout}>Выйти</button>
        </div>
    );
};

