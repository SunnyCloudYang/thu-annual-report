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
                title="常去的图书馆"
                data={data.booking.pieData}
                background="linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)"
                direction="up"
                chartType="pie"
            />
            <StatPage 
                title="运动场馆分布"
                data={data.sports.venueData}
                background="linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)"
                direction="right"
                chartType="pie"
            />
            <StatPage 
                title="运动项目偏好"
                data={data.sports.sportTypeData}
                background="linear-gradient(135deg, #08AEEA 0%, #2AF598 100%)"
                direction="up"
                chartType="doughnut"
            />
            <StatPage 
                title="运动时间分布"
                data={data.sports.timeSlotData}
                background="linear-gradient(135deg, #FEB692 0%, #EA5455 100%)"
                direction="left"
                chartType="bar"
            />
            <StatPage 
                title="月度收入"
                data={data.bank.monthlyData}
                background="linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)"
                direction="left"
                chartType="bar"
            />
            <StatPage 
                title="收入类型分布"
                data={data.bank.usageData}
                background="linear-gradient(135deg, #81FBB8 0%, #28C76F 100%)"
                direction="right"
                chartType="pie"
            />
            <StatPage 
                title="院系收入分布"
                data={data.bank.deptData}
                background="linear-gradient(135deg, #F6D365 0%, #FDA085 100%)"
                direction="up"
                chartType="doughnut"
            />
        </SlideContainer>
    );
};

export default Stats; 