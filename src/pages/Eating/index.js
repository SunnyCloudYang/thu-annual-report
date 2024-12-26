import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFlip } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-flip';
import './styles.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import './styles.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const processData = (data) => {
    const mealTypes = {
        breakfast: data.filter(tx => new Date(tx.timestamp).getHours() < 11), // Before 11 AM
        lunch: data.filter(tx => new Date(tx.timestamp).getHours() >= 11 && new Date(tx.timestamp).getHours() < 17), // Between 11 AM and 5 PM
        dinner: data.filter(tx => new Date(tx.timestamp).getHours() >= 17 && new Date(tx.timestamp).getHours() < 20), // Between 5 PM and 8 PM
        midnightSnack: data.filter(tx => new Date(tx.timestamp).getHours() >= 20 && new Date(tx.timestamp).getHours() < 24) // Between 8 PM and midnight
    };

    const totalAmount = {
        breakfast: mealTypes.breakfast.reduce((sum, tx) => sum + tx.amount, 0),
        lunch: mealTypes.lunch.reduce((sum, tx) => sum + tx.amount, 0),
        dinner: mealTypes.dinner.reduce((sum, tx) => sum + tx.amount, 0),
        midnightSnack: mealTypes.midnightSnack.reduce((sum, tx) => sum + tx.amount, 0)
    };

    const totalCount = {
        breakfast: mealTypes.breakfast.length,
        lunch: mealTypes.lunch.length,
        dinner: mealTypes.dinner.length,
        midnightSnack: mealTypes.midnightSnack.length
    };

    const averageAmount = {
        breakfast: totalCount.breakfast > 0 ? (totalAmount.breakfast / totalCount.breakfast).toFixed(2) : 0,
        lunch: totalCount.lunch > 0 ? (totalAmount.lunch / totalCount.lunch).toFixed(2) : 0,
        dinner: totalCount.dinner > 0 ? (totalAmount.dinner / totalCount.dinner).toFixed(2) : 0,
        midnightSnack: totalCount.midnightSnack > 0 ? (totalAmount.midnightSnack / totalCount.midnightSnack).toFixed(2) : 0
    };

    const addressCount = {};
    const windowCount = {};
    const windowTxCount = {};
    let maxAmount = { amount: 0, transaction: null };
    let minAmount = { amount: Infinity, transaction: null };
    let latestMeal = null;
    let earliestMeal = null;

    data.forEach(transaction => {
        // Count occurrences of each address
        addressCount[transaction.address] = (addressCount[transaction.address] || 0) + 1;

        // Count occurrences of each window
        windowCount[transaction.name] = (windowCount[transaction.name] || 0) + 1;

        // Determine max and min transactions
        if (transaction.amount > maxAmount.amount) {
            maxAmount = { amount: transaction.amount, transaction: transaction };
        }
        if (transaction.amount < minAmount.amount) {
            minAmount = { amount: transaction.amount, transaction: transaction };
        }
        if (!latestMeal || new Date(transaction.timestamp) > new Date(latestMeal.timestamp)) {
            latestMeal = transaction;
        }
        if (!earliestMeal || new Date(transaction.timestamp) < new Date(earliestMeal.timestamp)) {
            earliestMeal = transaction;
        }
    });

    const mostFrequentAddress = Object.keys(addressCount).reduce((a, b) => addressCount[a] > addressCount[b] ? a : b);
    const mostFrequentWindow = Object.keys(windowCount).reduce((a, b) => windowCount[a] > windowCount[b] ? a : b);

    // Add monthly statistics
    const monthlyStats = (() => {
        // Create an array of all months in Chinese
        const allMonths = Array.from({ length: 12 }, (_, i) =>
            new Date(2024, i).toLocaleString('zh-CN', { month: 'long' })
        );

        // Initialize all months with zero
        const initialStats = allMonths.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});

        // Fill in actual data
        return data.reduce((acc, tx) => {
            const month = new Date(tx.timestamp).toLocaleString('zh-CN', { month: 'long' });
            acc[month] += tx.amount;
            return acc;
        }, initialStats);
    })();

    return {
        mostFrequentAddress,
        mostFrequentWindow,
        addressCount,
        windowCount,
        averageAmount,
        totalCount,
        maxTransaction: maxAmount.transaction,
        minTransaction: minAmount.transaction,
        monthlyData: {
            labels: Object.keys(monthlyStats),
            values: Object.values(monthlyStats)
        },
        totalSpent: data.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2),
        latestMeal,
        earliestMeal
    };
};

const Eating = ({ data }) => {
    const processedData = processData(data);

    const mealChartData = {
        labels: ['早餐', '午餐', '晚餐', '夜宵'],
        datasets: [{
            data: [
                processedData.totalCount.breakfast,
                processedData.totalCount.lunch,
                processedData.totalCount.dinner,
                processedData.totalCount.midnightSnack
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(153, 102, 255, 0.8)'
            ]
        }]
    };

    const chartData = {
        labels: processedData.monthlyData.labels,
        datasets: [{
            data: processedData.monthlyData.values,
            fill: true,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.8)',
            tension: 0.4
        }]
    };

    const mealChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        borderRadius: 2,
        borderWidth: 0.5,
        hoverBorderWidth: 2,
        hoverOffset: 4,
        cutout: '50%',
        animation: {
            animateRotate: true,
            animateScale: true
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 14,
                    color: 'white',
                    usePointStyle: true,
                    generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, i) => ({
                            text: `${label} (平均 ¥${processedData.averageAmount[
                                ['breakfast', 'lunch', 'dinner', 'midnightSnack'][i]
                            ]})`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            index: i
                        }));
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value} 次`;
                    }
                }
            }
        }
    };

    const trendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                display: true
            },
            y: {
                display: true
            }
        }
    };

    return (
        <div className="eating-container">
            <div className="summary-section">
                <div className='subsection'>
                    <p className="highlight-text">
                        今年你在华清大学的食堂一共消费了<span className='large'>¥{processedData.totalSpent}</span>
                    </p>
                </div>
                <div className='subsection'>
                    <p>你一共到访了<span className='large'>{Object.keys(processedData.addressCount).length}</span>个食堂</p>
                    <p>但是你一定对<span className='large'>{processedData.mostFrequentAddress}</span>情有独钟吧，居然去了足足<span className='large'>{processedData.addressCount[processedData.mostFrequentAddress]}</span>次</p>
                </div>
                <div className='subsection'>
                    <p>{processedData.mostFrequentWindow.split('_')[0]}的<span className='large'>{processedData.mostFrequentWindow.split('_')[1].replace('组', '')}</span>窗口一定有你念念不忘的味道</p>
                    <p>你在那里消费了<span className='large'>{processedData.windowCount[processedData.mostFrequentWindow]}</span>次
                    </p>
                </div>
                <div className='subsection'>
                    <p><span className='large'>{new Date(processedData.maxTransaction?.timestamp).toLocaleString('zh-CN', { month: 'long', day: 'numeric' })}</span></p>
                    <p>你在{processedData.maxTransaction?.name.split('_')[0] + '的' + processedData.maxTransaction?.name.split('_')[1]}消费了<span className='large'>{processedData.maxTransaction?.amount}</span>元
                    </p>
                    <p>还记得那天是什么让你胃口大开吗？</p>
                </div>
            </div>

            <div className="charts-wrapper">
                <Swiper
                    effect='flip'
                    loop={true}
                    modules={[EffectFlip]}
                    style={{ width: '100%', height: 'calc(50% - 10px)' }}
                >
                    <SwiperSlide>
                        <div className="charts-container">
                            <div style={{ height: '20px' }}></div>
                            <p>你的饮食习惯</p>
                            <p>翻转卡片查看三餐频率统计</p>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="charts-container pie">
                            <Pie data={mealChartData} options={mealChartOptions} style={{ padding: '20px' }} />
                        </div>
                    </SwiperSlide>
                </Swiper>

                <Swiper
                    effect='flip'
                    loop={true}
                    modules={[EffectFlip]}
                    style={{ width: '100%', height: 'calc(50% - 10px)', marginTop: '20px' }}
                >
                    <SwiperSlide>
                        <div className="charts-container">
                            <div style={{ height: '20px' }}></div>
                            <p>你的消费趋势</p>
                            <p>翻转卡片查看每月消费统计</p>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="charts-container">
                            <Line data={chartData} options={trendChartOptions} style={{ padding: '20px 0' }} />
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>
        </div>
    );
};

export default Eating;
