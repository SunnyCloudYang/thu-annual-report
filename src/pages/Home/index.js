import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import './index.css';
import LoginForm from '../../components/LoginForm';

const Home = () => {
    const [showPrivacy, setShowPrivacy] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    //   const navigate = useNavigate();

    const handleAccept = () => {
        setShowPrivacy(false);
        setShowLogin(true);
    };

    const handleExit = () => {
        window.close();
        // Alternatively, navigate to an exit page
        // navigate('/exit');
    };

    return (
        <div className='home-background'>
            <div className="home-container">
                {showPrivacy && (
                    <div className="privacy-modal">
                        <div className="privacy-content">
                            <h1>欢迎来到华清大学2024年终总结！</h1>
                            <div className="privacy-text">
                                <p>2024过得真的很快呀，不知道这一年你有了哪些收获呢？让我们一起来看看吧~ 但是在开始之前，我认为有些事情还是说明白比较好！</p>
                                <ul>
                                    <li>你的信息（包括用户名、密码、其他数据等）只会在前端存储，<strong>不会</strong>传输到除清华大学官网以外的任何服务器上。并且在你关闭网页的瞬间，这些数据都会随着内存释放而灰飞烟灭，不会有包括开发者在内的任何人知道。</li>
                                    <li>你的信息是加密传输的，和登录官网一样安全。</li>
                                    <li>我们也许会统计有多少人使用了这个工具，但是放心，这些信息中不会包含任何和真实身份有关的信息，更不会包含账号密码等敏感信息。</li>
                                    <li>我们不会收集和存储任何个人数据，更不会（也无法）与其他人分享这些数据。</li>
                                </ul>
                                <p>如果你同意以上条款，可以点击开始回顾进入旅程！否则可以退出本页面。</p>
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
                )}

                {showLogin && <LoginForm />}
            </div>
        </div>
    );
};

export default Home;
