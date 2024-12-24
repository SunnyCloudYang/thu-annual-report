import React from 'react';
import SlideContainer from '../../components/SlideContainer';
import StatPage from '../../components/StatPage';
import LoadingBar from '../../components/LoadingBar';
// import './styles.css';

const Stats = ({ data, isLoading }) => {
    if (isLoading) {
        return <LoadingBar />;
    }

    return (
        <SlideContainer>
            <StatPage 
                title="图书馆学习时长"
                data={data.booking}
                background="linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)"
                direction="right"
                chartType="line"
            />
            <StatPage 
                title="消费分布"
                data={data.bank}
                background="linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)"
                direction="left"
                chartType="bar"
            />
        </SlideContainer>
    );
};

export default Stats; 