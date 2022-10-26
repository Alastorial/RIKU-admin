import React from 'react';
import cn from "classnames";
import st from "./SortButton.module.css";
import {ReactComponent as Arrow} from "../../../image/chevron.svg";

const SortButton = ({ id, text, updateFilter, filters }) => {
    return (
        <button id={id} name="sortButton" onClick={updateFilter} className={cn(st.sortButton, {[st.sortButtonSelected]: filters["sortBy"] === id})}>
            <span>{text}</span>
            <Arrow className={cn(st.arrow, {[st.arrowOpened]: (filters.sortBy === id && filters.sortToUp)})}/>
        </button>
    );
};

export default SortButton;