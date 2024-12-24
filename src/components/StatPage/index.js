import React from 'react';
import { motion } from 'framer-motion';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
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

const StatPage = ({ title, data, background, direction = 'right', chartType = 'line' }) => {
    const variants = {
        hidden: { 
            opacity: 0,
            x: direction === 'right' ? 100 : direction === 'left' ? -100 : 0,
            y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0
        },
        visible: { 
            opacity: 1,
            x: 0,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const getChartData = () => {
        switch (chartType) {
            case 'pie':
            case 'doughnut':
                return {
                    labels: data?.labels || [],
                    datasets: [{
                        data: data?.values || [],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                        ],
                        borderColor: 'rgba(255, 255, 255, 1)',
                        borderWidth: 2
                    }]
                };
            case 'bar':
                return {
                    labels: data?.labels || [],
                    datasets: [{
                        label: data?.label || '',
                        data: data?.values || [],
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        borderWidth: 2,
                        borderRadius: 8,
                        hoverBackgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }]
                };
            case 'line':
            default:
                return {
                    labels: data?.labels || [],
                    datasets: [{
                        label: data?.label || '',
                        data: data?.values || [],
                        fill: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        tension: 0.4,
                        pointBackgroundColor: 'white',
                        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(255, 255, 255, 1)'
                    }]
                };
        }
    };

    const getChartOptions = () => {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: chartType !== 'bar',
                    position: chartType === 'line' ? 'top' : 'right',
                    labels: {
                        color: '#2E2E3F',
                        font: { size: 14 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2E2E3F',
                    bodyColor: '#2E2E3F',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        };

        if (chartType === 'line' || chartType === 'bar') {
            return {
                ...baseOptions,
                scales: {
                    x: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#2E2E3F' }
                    },
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#2E2E3F' }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            };
        }

        return baseOptions;
    };

    const renderChart = () => {
        const chartData = getChartData();
        const chartOptions = getChartOptions();

        switch (chartType) {
            case 'pie':
                return <Pie data={chartData} options={chartOptions} />;
            case 'doughnut':
                return <Doughnut data={chartData} options={chartOptions} />;
            case 'bar':
                return <Bar data={chartData} options={chartOptions} />;
            case 'line':
            default:
                return <Line data={chartData} options={chartOptions} />;
        }
    };

    return (
        <div className="stat-page" style={{ background }}>
            <motion.div
                className="stat-content"
                initial="hidden"
                whileInView="visible"
                variants={variants}
                viewport={{ once: true }}
            >
                <h2>{title}</h2>
                <div className={`chart-container ${chartType}`}>
                    {renderChart()}
                </div>
                {data?.summary && (
                    <motion.div 
                        className="stat-summary"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p>{data.summary}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default StatPage; 