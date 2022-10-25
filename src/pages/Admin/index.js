import React from 'react';
import {useSelector} from "react-redux";
import {selectIsAuth} from "../../redux/slices/auth";
import {Redirect} from "react-router-dom";

export const Admin = () => {
    const isAuth = useSelector(selectIsAuth)
    // console.log(isAuth)

    if (!isAuth) {
        return <Redirect to="/auth" />
    }
    return (
        <div>
            <h1>sdsdfsdffds</h1>
        </div>
    );
};

