import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const LoadingBar = () => {
    return (
        <div className="loading-bar-container">
            <motion.div 
                className="loading-bar"
                initial={{ width: "0%" }}
                animate={{ 
                    width: "100%",
                    transition: { duration: 1.5, repeat: Infinity }
                }}
            />
            <p>正在获取数据...</p>
        </div>
    );
};

export default LoadingBar; 