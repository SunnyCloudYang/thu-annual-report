import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import './styles.css';

const SlideContainer = ({ children }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const totalSlides = React.Children.count(children);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlers = useSwipeable({
        onSwipedUp: () => isMobile && currentSlide < totalSlides - 1 && setCurrentSlide(prev => prev + 1),
        onSwipedDown: () => isMobile && currentSlide > 0 && setCurrentSlide(prev => prev - 1),
        onSwipedLeft: () => !isMobile && currentSlide < totalSlides - 1 && setCurrentSlide(prev => prev + 1),
        onSwipedRight: () => !isMobile && currentSlide > 0 && setCurrentSlide(prev => prev - 1),
    });

    return (
        <div {...handlers} className="slide-container">
            <motion.div
                className="slides-wrapper"
                style={{
                    transform: isMobile 
                        ? `translateY(-${currentSlide * 100}vh)`
                        : `translateX(-${currentSlide * 100}vw)`
                }}
            >
                {React.Children.map(children, (child, index) => (
                    <div className="slide" key={index}>
                        {child}
                    </div>
                ))}
            </motion.div>
            <div className="slide-indicators">
                {[...Array(totalSlides)].map((_, index) => (
                    <div
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SlideContainer; 