import React, { useState, useEffect } from 'react';
import SlideContainer from '../../components/SlideContainer';
import StatPage from '../../components/StatPage';
import LoginForm from '../../components/LoginForm';
import './index.css';

const Home = () => {
    const [showPrivacy, setShowPrivacy] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [statsData, setStatsData] = useState(null);

    const handleAccept = () => {
        setShowPrivacy(false);
        setShowLogin(true);
    };
    const handleExit = () => {
        setShowPrivacy(false);
    };

    useEffect(() => {
        if (isLoggedIn) {
            // Fetch your statistics data here
            fetchStats();
        }
    }, [isLoggedIn]);

    const fetchStats = async () => {
        try {
            const [bookingResponse, bankResponse] = await Promise.all([
                fetch('/api/getBookingRecordsStats/'),
                fetch('/api/getBankPaymentStats/')
            ]);

            const bookingData = await bookingResponse.json();
            const bankData = await bankResponse.json();

            const processBookingData = (data) => {
                const bookingStats = data.bookingRecord || [];
                return {
                    labels: bookingStats.map(record => record.date),
                    values: bookingStats.map(record => record.duration),
                    label: '图书馆学习时长（小时）',
                    summary: `今年你一共在图书馆学习了 ${bookingStats.reduce((acc, curr) => acc + curr.duration, 0)} 小时`
                };
            };

            const processBankData = (data) => {
                const bankStats = data.bankPayment || [];
                return {
                    labels: bankStats.map(record => record.date),
                    values: bankStats.map(record => record.amount),
                    label: '消费金额（元）',
                    summary: `今年你一共消费了 ${bankStats.reduce((acc, curr) => acc + curr.amount, 0)} 元`
                };
            };

            setStatsData({
                booking: processBookingData(bookingData),
                bank: processBankData(bankData)
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    if (showPrivacy) {
        return (
            <div className='home-background'>
                <div className='home-container'>
                    <div className="privacy-modal">
                        <div className="privacy-content">
                            <h1>欢迎来到华清大学2024年终总结！</h1>
                            <div className="privacy-text">
                                <p>2024过得真的很快呀，不知道这一年你有了哪些收获呢？让我们一起来看看吧~ 但是在开始之前，我认为有些事情还是说明白比较好！</p>
                                <ul>
                                    <li>因为浏览器跨域策略的限制，我们无法从前端发出请求来获取数据，因此你的信息（用户名和密码）会发送到服务器进行登录，但我们承诺<strong>不会</strong>传输到除清华大学官网以外的任何服务器上，也不会存储在我们的服务器上。在你断开连接之后，这些数据都会随着内存释放而灰飞烟灭，不会有包括开发者在内的任何人知道。</li>
                                    <li>你的信息是加密传输的，和登录官网一样安全。</li>
                                    <li>我们也许会统计有多少人使用了这个工具，但是放心，这些信息中不会使用任何你传输给我们的数据，更不会包含账号密码等敏感信息。</li>
                                    <li>我们承诺不会收集和存储任何个人信息和数据，更不会（也无法）与其他人分享这些数据。</li>
                                    <li>本项目的源代码开源在GitHub，欢迎大家审阅。</li>
                                </ul>
                                <p>如果你同意以上条款，可以点击开始回顾进入旅程！否则可以点击退出按钮退出本页面。</p>
                            </div>
                            <div className="privacy-buttons">
                                <button className="exit-btn" onClick={handleExit}>
                                    Exit
                                </button>
                                <button className="accept-btn" onClick={handleAccept}>
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showLogin) {
        return (
            <div className='home-background'>
                <div className='home-container'>
                    <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
                </div>
            </div>
        );
    }

    if (isLoggedIn && statsData) {
        return (
            <SlideContainer>
                <StatPage
                    title="图书馆学习时长"
                    data={statsData.booking}
                    background="linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)"
                    direction="right"
                    chartType="line"
                />
                <StatPage
                    title="消费分布"
                    data={statsData.bank}
                    background="linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)"
                    direction="left"
                    chartType="bar"
                />
                {/* Add more stat pages with different chart types */}
            </SlideContainer>
        );
    }

    return null;
};

export default Home;
