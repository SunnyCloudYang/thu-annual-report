import React, { useState, useContext } from 'react';
import { MdOutlineLogin } from "react-icons/md";
import { FaEarthAsia } from "react-icons/fa6";
import { GiRotaryPhone } from "react-icons/gi";
import './styles.css';
import { HelperContext } from '../../context/HelperContext';
import { v4 as uuidv4 } from 'uuid';

const LoginForm = () => {
    const [step, setStep] = useState('credentials');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fingerprint: '',
    });
    const helper = useContext(HelperContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 'credentials') {
            // Simulate API call to validate credentials
            setIsLoading(true);
            helper.login({
                userId: formData.username,
                password: formData.password,
                fingerprint: uuidv4().replace(/-/g, '')
            }).then(() => {
                setIsLoading(false);
                setStep('2fa');
            }).catch((error) => {
                setIsLoading(false);
                alert(error.message);
            });
        } else if (step === '2fa') {
            setIsLoading(true);
            // Simulate API call for 2FA verification
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsLoading(false);
            // Redirect to dashboard or show content
            document.body.style.overflow = 'auto';
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
                    </>
                ) : (
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
                )}
                <button type="submit" className="submit-btn">
                    {step === 'credentials' ? '登录' : '验证'}
                </button>
            </form>
            <span className='phone-number'><GiRotaryPhone /> 010-20255202</span>
        </div>
    );
};

export default LoginForm; 