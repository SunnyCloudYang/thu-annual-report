import React, { useState, useEffect } from 'react';
import Privacy from '../Privacy';
import Stats from '../Stats';
import LoginForm from '../../components/LoginForm';
import './index.css';

const processBookingData = (data) => {
    const bookingStats = data.bookingRecord || [];
    const locationStats = bookingStats.reduce((acc, record) => {
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
    const allPayments = data.bankPayment?.reduce((acc, month) => [...acc, ...month.payment], []) || [];
    const usageStats = allPayments.reduce((acc, payment) => {
        acc[payment.usage] = (acc[payment.usage] || 0) + parseFloat(payment.actual);
        return acc;
    }, {});
    const deptStats = allPayments.reduce((acc, payment) => {
        const dept = payment.department.split(' ')[1];
        acc[dept] = (acc[dept] || 0) + parseFloat(payment.actual);
        return acc;
    }, {});

    return {
        monthlyData: {
            labels: data.bankPayment?.map(month => month.month) || [],
            values: data.bankPayment?.map(month => 
                month.payment.reduce((acc, p) => acc + parseFloat(p.actual), 0)
            ) || [],
            label: '月度收入（元）',
            summary: `今年你一共收入了 ${allPayments.reduce((acc, curr) => acc + parseFloat(curr.actual), 0).toFixed(2)} 元`
        },
        usageData: { labels: Object.keys(usageStats), values: Object.values(usageStats) },
        deptData: { labels: Object.keys(deptStats), values: Object.values(deptStats) }
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

    // Group by time slot
    const timeSlotStats = sportsRecords.reduce((acc, record) => {
        const timeSlot = record.time.split('  ')[1].split('-')[0];
        acc[timeSlot] = (acc[timeSlot] || 0) + 1;
        return acc;
    }, {});

    // Sort time slots chronologically
    const sortedTimeSlots = Object.entries(timeSlotStats)
        .sort(([a], [b]) => parseInt(a.split(':')[0]) - parseInt(b.split(':')[0]));

    return {
        venueData: {
            labels: Object.keys(venueStats),
            values: Object.values(venueStats),
            summary: `今年你一共运动了 ${sportsRecords.length} 次，最常去 ${
                Object.entries(venueStats).sort(([,a], [,b]) => b - a)[0][0]
            }`
        },
        sportTypeData: {
            labels: Object.keys(sportTypeStats),
            values: Object.values(sportTypeStats),
            summary: `最喜欢的运动是${
                Object.entries(sportTypeStats).sort(([,a], [,b]) => b - a)[0][0]
            }`
        },
        timeSlotData: {
            labels: sortedTimeSlots.map(([time]) => time),
            values: sortedTimeSlots.map(([, count]) => count),
            label: '运动时段分布',
            summary: `最常运动的时间是 ${
                sortedTimeSlots.sort(([,a], [,b]) => b - a)[0][0]
            }`
        }
    };
};

const processCardData = (data) => {
    const transactions = data.cardTransactions || [];

    // Separate eating and shower transactions
    const eatingTransactions = transactions.filter(tx => 
        !tx.name.includes('淋浴')
    );
    const showerTransactions = transactions.filter(tx => 
        tx.name.includes('淋浴')
    );

    // Group eating by location
    const locationStats = eatingTransactions.reduce((acc, tx) => {
        acc[tx.address] = (acc[tx.address] || 0) + tx.amount;
        return acc;
    }, {});

    // Group by meal time
    const mealTypeStats = eatingTransactions.reduce((acc, tx) => {
        const hour = new Date(tx.timestamp).getHours();
        if (hour >= 5 && hour < 10) acc['早餐'] = (acc['早餐'] || 0) + tx.amount;
        else if (hour >= 10 && hour < 15) acc['午餐'] = (acc['午餐'] || 0) + tx.amount;
        else if (hour >= 15 && hour < 20) acc['晚餐'] = (acc['晚餐'] || 0) + tx.amount;
        else acc['夜宵'] = (acc['夜宵'] || 0) + tx.amount;
        return acc;
    }, {});

    // Group by month
    const monthlyStats = transactions.reduce((acc, tx) => {
        const month = new Date(tx.timestamp).toLocaleString('zh-CN', { month: 'long' });
        acc[month] = (acc[month] || 0) + tx.amount;
        return acc;
    }, {});

    return {
        locationData: {
            labels: Object.keys(locationStats),
            values: Object.values(locationStats),
            summary: `今年你最常去的食堂是${
                Object.entries(locationStats).sort(([,a], [,b]) => b - a)[0][0]
            }`
        },
        mealTypeData: {
            labels: Object.keys(mealTypeStats),
            values: Object.values(mealTypeStats),
            summary: `花费最多的是${
                Object.entries(mealTypeStats).sort(([,a], [,b]) => b - a)[0][0]
            }`
        },
        monthlyData: {
            labels: Object.keys(monthlyStats),
            values: Object.values(monthlyStats),
            label: '月度消费（元）',
            summary: `全年共消费 ${
                Object.values(monthlyStats).reduce((a, b) => a + b, 0).toFixed(2)
            } 元`
        },
        showerData: {
            labels: ['淋浴次数', '总花费(元)'],
            values: [
                showerTransactions.length,
                showerTransactions.reduce((acc, tx) => acc + tx.amount, 0)
            ],
            summary: `今年你一共洗了 ${showerTransactions.length} 次澡，共花费 ${
                showerTransactions.reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)
            } 元`
        }
    };
};

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
            setIsLoading(true);
            fetchStats().finally(() => setIsLoading(false));
        }
    }, [isLoggedIn]);

    const fetchStats = async () => {
        try {
            const sessionId = localStorage.getItem('sessionId');
            const headers = { 'session-id': sessionId };

            const [bankResponse, sportsResponse, cardResponse] = await Promise.all([
                // fetch('/api/getBookingRecords/', { headers }),
                fetch('/api/getBankPayment/', { headers }),
                fetch('/api/getSportsRecords/', { headers }),
                fetch('/api/getCardTransactions/', { headers })
            ]);

            const responses = await Promise.all([
                // bookingResponse.json(),
                bankResponse.json(),
                sportsResponse.json(),
                cardResponse.json()
            ]);

            if (responses.every(res => res.success)) {
                setStatsData({
                    // booking: processBookingData(responses[0]),
                    bank: processBankData(responses[1]),
                    sports: processSportsData(responses[2]),
                    card: processCardData(responses[3])
                });
            } else if (responses.some(res => res.message === 'Session not found')) {
                setShowLogin(true);
            } else if (responses.some(res => res.message === 'Two-factor authentication required')) {
                setShowLogin(true);
            } else {
                throw new Error('One or more responses indicated failure');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
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
