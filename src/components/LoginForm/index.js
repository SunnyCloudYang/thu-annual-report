import React, { useEffect, useState } from 'react';
import { MdOutlineLogin } from "react-icons/md";
import { FaEarthAsia, FaArrowUp } from "react-icons/fa6";
import { GiRotaryPhone } from "react-icons/gi";
import { encrypt } from '../../utils/crypto';
import ProgressBar from 'react-bootstrap/ProgressBar';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const LoginForm = (props) => {
    const { onLoginSuccess, isFetchingData, fetchingProgress } = props;
    const [step, setStep] = useState('credentials');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fingerprint: '',
        twoFactorCode: '',
        twofaMethod: ''
    });
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        fetch('/api/')
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 'credentials') {
            // Simulate API call to validate credentials
            setIsLoading(true);
            const encryptedData = {
                userId: encrypt(formData.username),
                password: encrypt(formData.password),
                twoFactorMethod: formData.twofaMethod
            };
            await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(encryptedData)
            })
                .then(res => res.json())
                .then(async (data) => {
                    if (data.requiresCode) {
                        setStep('2fa');
                        setSessionId(data.sessionId);
                        localStorage.setItem('sessionId', data.sessionId);
                    } else if (data.success) {
                        setStep('ready');
                        setSessionId(data.sessionId);
                        localStorage.setItem('sessionId', data.sessionId);
                        onLoginSuccess();
                    } else {
                        console.error('Login failed:', data.message);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
            setIsLoading(false);
        } else if (step === '2fa') {
            setIsLoading(true);
            // Simulate API call for 2FA verification
            await fetch('/api/verify-2fa/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    code: formData.twoFactorCode
                })
            })
                .then(res => res.json())
                .then(async (data) => {
                    // Redirect to dashboard or show content
                    document.body.style.overflow = 'auto';
                    if (data.success) {
                        setStep('ready');
                        onLoginSuccess();
                    }
                })
                .catch(err => console.error(err));
            setIsLoading(false);
        } else {
            // Redirect to dashboard or show content
            document.body.style.overflow = 'auto';
            console.log('Ready to go');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Please wait...</p>
            </div>
        );
    }

    if (isFetchingData) {
        return (
            <div className="loading-container">
                <p>时光机正在倒带，马上就好！</p>
                <ProgressBar>
                    <ProgressBar animated variant='info' now={fetchingProgress[0]} key={1} />
                    <ProgressBar animated variant='warning' now={fetchingProgress[1]} key={2} />
                    <ProgressBar animated variant='success' now={fetchingProgress[2]} key={3} />
                </ProgressBar>
            </div>
        );
    }

    return (
        <div className="login-container">
            <span className='fake-language'><FaEarthAsia /> Happy 2025</span>
            <h2>华清大学年度总结系统</h2>
            <h3>您即将开启<MdOutlineLogin />2024回顾之旅</h3>
            <form onSubmit={handleSubmit} className="login-form">
                {step === 'credentials' ? (
                    <>
                        <div className='dttab'>
                            <h3>用户密码登录</h3>
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">学号</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="学号"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">密码</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="密码"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <p className="forgot-it">忘记烦恼</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="twofaMethod">选择两步验证方式</label>
                            <select
                                name="twofaMethod"
                                value={formData.twofaMethod}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>请选择验证方式</option>
                                <option value="mobile">手机</option>
                                <option value="wechat">企业微信</option>
                                <option value="totp">TOTP</option>
                            </select>
                        </div>
                    </>
                ) : step === '2fa' ? (
                    <>
                        <h2>Two-Factor Authentication</h2>
                        <div className="form-group">
                            <input
                                type="text"
                                name="twoFactorCode"
                                placeholder="Enter 2FA Code"
                                value={formData.twoFactorCode}
                                onChange={handleChange}
                                maxLength="6"
                                required
                            />
                        </div>
                    </>
                ) : (
                    <div className="ready-container">
                        <h2>让我们一起出发吧!</h2>
                        <div className="slide-hint">
                            <div className="slide-arrow">
                                <FaArrowUp />
                            </div>
                            <p>上滑开启旅程</p>
                        </div>
                    </div>
                )}
                {step !== 'ready' && <button type="submit" className="submit-btn">
                    {step === 'credentials' ? '登录' : '验证'}
                </button>
                }
            </form>
            <span className='phone-number'><GiRotaryPhone /> 010-20255202</span>
        </div>
    );
};

export default LoginForm; 