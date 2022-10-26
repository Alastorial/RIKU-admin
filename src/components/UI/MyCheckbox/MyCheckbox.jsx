import React from 'react';
import st from "./MyCheckbox.module.css";

const MyCheckbox = ({ filters, onChange, id, name, text}) => {
    return (
        <div className={st.checkbox}>
            <input onChange={onChange} type="checkbox" id={id} name={name} checked={filters[id]}/>
            <label htmlFor={id}>{text}</label>
        </div>
    );
};

export default MyCheckbox;