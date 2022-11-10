import React from 'react';
import st from "./Loader.module.css";
import {motion} from 'framer-motion';


const Loader = ({width = 50, display}) => {

    // анимация
    const animation = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                delay: 2
            },
        },
    }

    return (
        <motion.div variants={animation} initial="hidden" whileInView="visible" viewport={{amount: 0, once: true}} className={st.loaderBlock} style={{width: width, height: width, display: display}}>
            <div className={st.firstRect}></div>
            <div className={st.secondRect}></div>
            <div className={st.thirdRect}></div>
            <div className={st.fourthRect}></div>
        </motion.div>
    );
};

export default Loader;