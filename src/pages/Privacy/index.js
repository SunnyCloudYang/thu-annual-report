import React from 'react';
import './styles.css';

const Privacy = ({ onAccept, onExit }) => {
    return (
        <div className='home-background'>
            <div className='home-container'>
                <div className="privacy-modal">
                    <div className="privacy-content">
                        <h1>欢迎来到华清大学2024年终总结！</h1>
                        <div className="privacy-text">
                            <p>2024过得真的很快呀，不知道这一年你有了哪些收获呢？让我们一起来看看吧~ 但是在开始之前，我认为有些事情还是说明白比较好！</p>
                            <ul>
                                <li>因为浏览器跨域策略的限制，我们无法从前端发出请求来获取数据，因此你的信息（用户名和密码）会发送到服务器进行登录，但我们承诺<strong>不会</strong>传输到除清华大学官网以外的任何服务器上，也不会存储在我们的服务器上。</li>
                                <li>你的信息是加密传输的，和登录官网一样安全。</li>
                                <li>我们也许会统计有多少人使用了这个工具，但是放心，这些信息中不会使用任何你传输给我们的数据，更不会包含账号密码等敏感信息。</li>
                                <li>我们承诺不会收集和存储任何个人信息和数据，更不会（也无法）与其他人分享这些数据。</li>
                                <li>本项目的源代码开源在GitHub，欢迎大家审阅。</li>
                            </ul>
                            <p>如果你同意以上条款，可以点击开始回顾进入旅程！否则可以点击退出按钮退出本页面。</p>
                        </div>
                        <div className="privacy-buttons">
                            <button className="exit-btn" onClick={onExit}>
                                Exit
                            </button>
                            <button className="accept-btn" onClick={onAccept}>
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy; 