import React from 'react';
import st from "./MiniProjectLine.module.css";

const MiniProjectLine = ({ id, onMove, numOfLines }) => {
    const onMouse = () => {
        onMove(id);
    }
    return (
        <div className={st.lineBox} onMouseEnter={onMouse} style={{width: `calc(100% / ${numOfLines} - 6px`}}>
            <hr className={st.line}/>
        </div>
    );
};

export default MiniProjectLine;