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
    const [showPrivacy, setShowPrivacy] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [fetchingProgress, setFetchingProgress] = useState([0, 0, 0]);
    const [completedSections, setCompletedSections] = useState([false, false, false]);

    useEffect(() => {
        // Estimated time for each operation in seconds
        const estimatedTime = [3, 1, 8];  // login, booking, card+bank
        const finalProportions = [25, 25, 50];  // Final percentages for each section

        if (isFetchingData) {
            const totalTime = estimatedTime.reduce((a, b) => a + b, 0);
            const progressPerSecond = 90 / totalTime;

            let elapsed = 0;
            const interval = setInterval(() => {
                elapsed += 0.1;  // Update every 100ms
                
                // Calculate progress for each section
                const newProgress = estimatedTime.map((time, index) => {
                    // If section is completed, return its final proportion
                    if (completedSections[index]) {
                        return finalProportions[index];
                    }

                    const sectionStart = estimatedTime.slice(0, index).reduce((a, b) => a + b, 0);
                    const sectionProgress = Math.max(0, Math.min(
                        finalProportions[index] * 0.9,  // 90% of final proportion
                        (elapsed - sectionStart) * progressPerSecond * 10 * 
                        (finalProportions[index] / (time * progressPerSecond))
                    ));
                    return sectionProgress;
                });
                
                setFetchingProgress(newProgress);
            }, 100);

            return () => clearInterval(interval);
        }
    }, [isFetchingData, completedSections]);

    const handleAccept = () => {
        setShowPrivacy(false);
    };

    const handleExit = () => {
        window.close();
    };

    const fetchStats = useCallback(async () => {
        try {
            const sessionId = localStorage.getItem('sessionId');
            const headers = { 'session-id': sessionId };

            const [bookingResponse, cardResponse, bankResponse] = await Promise.all([
                fetch('/api/getBookingRecords/', { headers })
                    .then(res => {
                        setCompletedSections(prev => [true, prev[1], prev[2]]);
                        return res;
                    }),
                fetch('/api/getCardTransactions/', { headers })
                    .then(res => {
                        setCompletedSections(prev => [prev[0], true, prev[2]]);
                        return res;
                    }),
                fetch('/api/getBankPayment/', { headers })
                    .then(res => {
                        setCompletedSections(prev => [prev[0], prev[1], true]);
                        return res;
                    })
            ]);

            const responses = await Promise.all([
                bookingResponse.json(),
                cardResponse.json(),
                bankResponse.json()
            ]);

            if (responses.every(res => res.success)) {
                setData({
                    booking: responses[0].bookingRecord,
                    eating: processCardData(responses[1]).eatingTransactions,
                    shower: processCardData(responses[1]).showerTransactions,
                    bank: processBankData(responses[2])
                });
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
            setCompletedSections([false, false, false]);
            fetchStats().finally(() => {
                setIsFetchingData(false);
            });
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
                        isFetchingData={isFetchingData}
                        fetchingProgress={fetchingProgress}
                    />
                </div>
            </div>
        );
    }
};

export default Home;
