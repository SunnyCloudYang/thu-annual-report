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
            const [bookingResponse, bankResponse] = await Promise.all([
                fetch('/api/getBookingRecordsStats/'),
                fetch('/api/getBankPaymentStats/')
            ]);
            
            const bookingData = await bookingResponse.json();
            const bankData = await bankResponse.json();
            
            const processBookingData = (data) => ({
                labels: data.bookingRecord?.map(record => record.date) || [],
                values: data.bookingRecord?.map(record => record.duration) || [],
                label: '图书馆学习时长（小时）',
                summary: `今年你一共在图书馆学习了 ${data.bookingRecord?.reduce((acc, curr) => acc + curr.duration, 0) || 0} 小时`
            });

            const processBankData = (data) => ({
                labels: data.bankPayment?.map(record => record.date) || [],
                values: data.bankPayment?.map(record => record.amount) || [],
                label: '消费金额（元）',
                summary: `今年你一共消费了 ${data.bankPayment?.reduce((acc, curr) => acc + curr.amount, 0) || 0} 元`
            });

            setStatsData({
                booking: processBookingData(bookingData),
                bank: processBankData(bankData)
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
