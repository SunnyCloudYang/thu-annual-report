import React, { useState, useEffect } from 'react';
import Privacy from '../Privacy';
import Stats from '../Stats';
import LoginForm from '../../components/LoginForm';
import './index.css';

const Home = () => {
    const [showPrivacy, setShowPrivacy] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAccept = () => {
        setShowPrivacy(false);
        setShowLogin(true);
    };

    const handleExit = () => {
        setShowPrivacy(false);
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchStats();
        }
    }, [isLoggedIn]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [bookingResponse, bankResponse, sportsResponse] = await Promise.all([
                fetch('/api/getBookingRecords/'),
                fetch('/api/getBankPayment/'),
                fetch('/api/getSportsRecords/'),
                fetch('/api/getCardTransactions/')
            ]);
            
            const bookingData = await bookingResponse.json();
            const bankData = await bankResponse.json();
            const sportsData = await sportsResponse.json();
            
            const processBookingData = (data) => {
                const bookingStats = data.bookingRecord || [];
                
                // Filter only used records and sort by date
                const usedRecords = bookingStats
                    .filter(record => record.status === "已使用")
                    .sort((a, b) => new Date(a.time) - new Date(b.time));

                // Group by location
                const locationStats = usedRecords.reduce((acc, record) => {
                    const location = record.pos.split('-')[0];
                    acc[location] = (acc[location] || 0) + 1;
                    return acc;
                }, {});

                return {
                    pieData: {
                        labels: Object.keys(locationStats),
                        values: Object.values(locationStats),
                        summary: `今年你最常去的是 ${Object.entries(locationStats)
                            .sort(([,a], [,b]) => b - a)[0][0]}`
                    }
                };
            };

            const processBankData = (data) => {
                const allPayments = data.bankPayment?.reduce((acc, month) => {
                    return [...acc, ...month.payment];
                }, []) || [];

                // Group by usage type
                const usageStats = allPayments.reduce((acc, payment) => {
                    acc[payment.usage] = (acc[payment.usage] || 0) + parseFloat(payment.actual);
                    return acc;
                }, {});

                // Group by department
                const deptStats = allPayments.reduce((acc, payment) => {
                    const dept = payment.department.split(' ')[1];
                    acc[dept] = (acc[dept] || 0) + parseFloat(payment.actual);
                    return acc;
                }, {});

                const totalAmount = allPayments.reduce((acc, curr) => 
                    acc + parseFloat(curr.actual), 0
                );

                return {
                    // Bar chart for monthly totals
                    monthlyData: {
                        labels: data.bankPayment?.map(month => month.month) || [],
                        values: data.bankPayment?.map(month => 
                            month.payment.reduce((acc, payment) => 
                                acc + parseFloat(payment.actual), 0
                            )
                        ) || [],
                        label: '月度收入（元）',
                        summary: `今年你一共收入了 ${totalAmount.toFixed(2)} 元`
                    },
                    // Pie chart for usage distribution
                    usageData: {
                        labels: Object.keys(usageStats),
                        values: Object.values(usageStats),
                        summary: `其中 ${Object.entries(usageStats)
                            .sort(([,a], [,b]) => b - a)[0][0]} 收入最多`
                    },
                    // Doughnut chart for department distribution
                    deptData: {
                        labels: Object.keys(deptStats),
                        values: Object.values(deptStats),
                        summary: `主要来自 ${Object.entries(deptStats)
                            .sort(([,a], [,b]) => b - a)[0][0]}`
                    }
                };
            };

            const processSportsData = (data) => {
                const sportsRecords = data.sportsRecord || [];

                // Group by venue
                const venueStats = sportsRecords.reduce((acc, record) => {
                    acc[record.name] = (acc[record.name] || 0) + 1;
                    return acc;
                }, {});

                // Group by sport type
                const sportTypeStats = sportsRecords.reduce((acc, record) => {
                    const type = record.field.split(' ')[0].replace('西体', '');
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});

                // Calculate total spending
                const totalSpending = sportsRecords.reduce((acc, record) => 
                    acc + parseFloat(record.price || 0), 0
                );

                // Group by time slot
                const timeSlotStats = sportsRecords.reduce((acc, record) => {
                    const timeSlot = record.time.split('  ')[1].split('-')[0];
                    acc[timeSlot] = (acc[timeSlot] || 0) + 1;
                    return acc;
                }, {});

                // Sort time slots chronologically
                const sortedTimeSlots = Object.entries(timeSlotStats)
                    .sort(([a], [b]) => {
                        return parseInt(a.split(':')[0]) - parseInt(b.split(':')[0]);
                    });

                return {
                    // Pie chart for venue distribution
                    venueData: {
                        labels: Object.keys(venueStats),
                        values: Object.values(venueStats),
                        summary: `今年你一共运动了 ${sportsRecords.length} 次，最常去 ${
                            Object.entries(venueStats)
                                .sort(([,a], [,b]) => b - a)[0][0]
                        }`
                    },
                    // Doughnut chart for sport types
                    sportTypeData: {
                        labels: Object.keys(sportTypeStats),
                        values: Object.values(sportTypeStats),
                        summary: `最喜欢的运动是 ${
                            Object.entries(sportTypeStats)
                                .sort(([,a], [,b]) => b - a)[0][0]
                        }`
                    },
                    // Bar chart for time slot preference
                    timeSlotData: {
                        labels: sortedTimeSlots.map(([time]) => time),
                        values: sortedTimeSlots.map(([, count]) => count),
                        label: '运动时段分布',
                        summary: `最常运动的时间是 ${
                            sortedTimeSlots.sort(([,a], [,b]) => b - a)[0][0]
                        }`
                    },
                    // Additional summary
                    spendingData: {
                        labels: ['运动消费'],
                        values: [totalSpending],
                        summary: `今年在运动上花费了 ${totalSpending.toFixed(2)} 元`
                    }
                };
            };

            setStatsData({
                booking: processBookingData(bookingData),
                bank: processBankData(bankData),
                sports: processSportsData(sportsData)
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (showPrivacy) {
        return <Privacy onAccept={handleAccept} onExit={handleExit} />;
    }

    if (showLogin) {
        return (
            <div className='home-background'>
                <div className='home-container'>
                    <LoginForm onLoginSuccess={() => {
                        setIsLoggedIn(true);
                        setShowLogin(false);
                        }} />
                </div>
            </div>
        );
    }

    if (isLoggedIn) {
        return <Stats data={statsData} isLoading={isLoading} />;
    }

    return null;
};

export default Home;
