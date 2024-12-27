import React, { useState, useEffect, useCallback } from 'react';
import Privacy from '../Privacy';
import LoginForm from '../../components/LoginForm';
import './index.css';


const processBankData = (data) => {
    const thisYear = new Date().getFullYear();
    const yearPayments = data.bankPayment?.filter(payment => payment.month.includes(thisYear)) || [];
    return yearPayments;
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
    return { eatingTransactions, showerTransactions };
};

const Home = ({ setData }) => {
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);

    const handleAccept = () => {
        setShowPrivacy(false);
    };

    const handleExit = () => {
        setShowPrivacy(false);
    };

    const fetchStats = useCallback(async () => {
        try {
            const sessionId = localStorage.getItem('sessionId');
            const headers = { 'session-id': sessionId };

            const [bankResponse, cardResponse] = await Promise.all([
                fetch('/api/getBankPayment/', { headers }),
                fetch('/api/getCardTransactions/', { headers })
            ]);

            const responses = await Promise.all([
                bankResponse.json(),
                cardResponse.json()
            ]);

            if (responses.every(res => res.success)) {
                setData({
                    bank: processBankData(responses[0]),
                    eating: processCardData(responses[1]).eatingTransactions,
                    shower: processCardData(responses[1]).showerTransactions
                });
            } else if (responses.some(res => res.message === 'Session not found')) {
                setIsLoggedIn(false);
            } else if (responses.some(res => res.message === 'Two-factor authentication required')) {
                setIsLoggedIn(false);
            } else {
                throw new Error('One or more responses indicated failure');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [setData]);

    useEffect(() => {
        if (isLoggedIn) {
            setIsFetchingData(true);
            fetchStats().finally(() => setIsFetchingData(false));
        }
    }, [isLoggedIn, fetchStats]);

    if (showPrivacy) {
        return <Privacy onAccept={handleAccept} onExit={handleExit} />;
    } else {
        return (
            <div className='home-background'>
                <div className='home-container'>
                    <LoginForm
                        onLoginSuccess={() => {
                            setIsLoggedIn(true);
                        }}
                        isFetchingData={isFetchingData} />
                </div>
            </div>
        );
    }
};

export default Home;
