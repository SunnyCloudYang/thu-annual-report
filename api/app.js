const express = require('express');
const path = require('path');
const { InfoHelper } = require('@thu-info/lib');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const fs = require('fs');
const app = express();

// API routes come first
app.use('/api', express.json());  // Apply JSON parsing only to API routes

// Store 2FA resolvers for each session
const twoFactorResolvers = new Map();
const helpers = new Map();

app.get('/api/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'THU Annual API is ready!'
    });
});

app.post('/api/login/', async (req, res) => {
    try {
        const { userId, password, twoFactorMethod } = req.body;
        const sessionId = uuidv4();
        const helper = new InfoHelper();
        helper.fingerprint = sessionId.replace(/-/g, '');
        helpers.set(sessionId, helper);

        helper.twoFactorMethodHook = async (hasWeChatBool, phone, hasTotp) => {
            if (twoFactorMethod === 'mobile' && phone) {
                return 'mobile';
            } else if (twoFactorMethod === 'wechat' && hasWeChatBool) {
                return 'wechat';
            } else if (twoFactorMethod === 'totp' && hasTotp) {
                return 'totp';
            } else {
                return phone ? 'mobile' : hasWeChatBool ? 'wechat' : 'totp';
            }
        };

        helper.twoFactorAuthHook = async () => {
            res.status(202).json({
                success: true,
                message: 'Two-factor authentication required',
                requiresCode: true,
                sessionId: sessionId
            });
            return new Promise((resolve) => {
                twoFactorResolvers.set(sessionId, { resolve, helper });
            });
        };

        helper.trustFingerprintHook = async () => true;

        await helper.login({ userId, password });

        if (!res.headersSent) {
            res.status(200).json({ 
                success: true,
                message: 'Login successful'
            });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }
});

app.post('/api/verify-2fa/', async (req, res) => {
    try {
        const { code, sessionId } = req.body;
        const session = twoFactorResolvers.get(sessionId);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const { resolve, helper } = session;
        resolve(code);
        twoFactorResolvers.delete(sessionId);

        res.status(200).json({
            success: true,
            message: 'Two-factor authentication successful'
        });
    } catch (error) {
        if (!res.headersSent) {
            res.status(401).json({
                success: false,
                message: error.message || '2FA verification failed'
            });
        }
    }
});

app.get('/api/getBookingRecords/', async (req, res) => {
    try {
        const sessionId = req.headers['session-id'];
        const helper = helpers.get(sessionId);
        
        if (!helper) {
            return res.status(401).json({
                success: false,
                message: 'Session not found'
            });
        }

        const bookingRecord = await helper.getBookingRecords();
        !res.headersSent && res.status(200).json({
            success: true,
            bookingRecord
        });
    } catch (error) {
        !res.headersSent && res.status(401).json({
            success: false,
            message: error.message || 'Failed to get booking record'
        });
    }
});

app.get('/api/getBankPayment/', async (req, res) => {
    try {
        const sessionId = req.headers['session-id'];
        const helper = helpers.get(sessionId);
        
        if (!helper) {
            return res.status(401).json({
                success: false,
                message: 'Session not found'
            });
        }

        const bankPayment = await helper.getBankPayment();
        !res.headersSent && res.status(200).json({
            success: true,
            bankPayment
        });
    } catch (error) {
        !res.headersSent && res.status(401).json({
            success: false,
            message: error.message || 'Failed to get bank payment'
        });
    }
});

app.get('/api/getSportsRecords/', async (req, res) => {
    try {
        // const sportsRecord = await helper.getSportsReservationRecords();
        const sportsRecord = [
            {
                name: "西体育馆",
                field: "西体台球 (台7)",
                time: "2021-10-06  20:00-21:00",
                price: "15.0",
                method: "网上支付",
                bookTimestamp: 1667269469000,
                bookId: undefined,
                payId: undefined,
            },
            {
                name: "西体育馆",
                field: "西体羽毛球场 (羽4)",
                time: "2021-10-07  7:00-8:00",
                price: "40.0",
                method: "",
                bookTimestamp: undefined,
                bookId: undefined,
                payId: undefined,
            },
            {
                name: "西体育馆",
                field: "西体羽毛球场 (羽8)",
                time: "2021-10-08  7:00-8:00",
                price: "40.0",
                method: "",
                bookTimestamp: undefined,
                bookId: undefined,
                payId: undefined,
            }
        ];
        !res.headersSent && res.status(200).json({
            success: true,
            sportsRecord
        });
    } catch (error) {
        !res.headersSent && res.status(401).json({
            success: false,
            message: error.message || 'Failed to get sports record'
        });
    }
});

app.get('/api/getCardTransactions/', async (req, res) => {
    try {
        const sessionId = req.headers['session-id'];
        const helper = helpers.get(sessionId);
        
        if (!helper) {
            return res.status(401).json({
                success: false,
                message: 'Session not found'
            });
        }

        const cardTransactions = await helper.getCampusCardTransactions('2024-01-01', '2024-12-31', 1);
        !res.headersSent && res.status(200).json({
            success: true,
            cardTransactions
        });
    } catch (error) {
        !res.headersSent && res.status(401).json({
            success: false,
            message: error.message || 'Failed to get card transactions'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    !res.headersSent && res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.use(express.static(path.join(__dirname, '..', 'build')));

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

// Create HTTPS server
const httpsOptions = {
    key: fs.readFileSync('/home/ubuntu/ssl/annual.thu-life.online.key'),
    cert: fs.readFileSync('/home/ubuntu/ssl/annual.thu-life.online.pem')
};

const PORT = process.env.PORT || 443;
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});

module.exports = app;
