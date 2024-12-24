const express = require('express');
const path = require('path');
const { InfoHelper } = require('@thu-info/lib');
const { v4: uuidv4 } = require('uuid');
const app = express();

// app.use(express.json());

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Store 2FA resolvers for each session
const twoFactorResolvers = new Map();
console.log("twoFactorResolvers", twoFactorResolvers);

app.get('/api/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'THU Annual API is ready!'
    });
});

app.post('/api/login/', async (req, res) => {
    try {
        const { userId, password, twoFactorMethod } = req.body;
        const helper = new InfoHelper();
        const sessionId = uuidv4();
        helper.fingerprint = sessionId.replace(/-/g, '');

        helper.twoFactorMethodHook = async (hasWeChatBool, phone, hasTotp) => {
            if (twoFactorMethod === 'mobile' && phone) {
                return 'mobile';
            } else if (twoFactorMethod === 'wechat' && hasWeChatBool) {
                return 'wechat';
            } else if (twoFactorMethod === 'totp' && hasTotp) {
                return 'totp';
            } else {
                return phone ? 'mobile' : hasWeChatBool ? 'wechat' :  'totp';
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

        helper.trustFingerprintHook = async () => {
            return false;
        };

        await helper.login({
            userId,
            password,
        });
        const bookingRecord = await helper.getBookingRecords();

        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            bookingRecord: bookingRecord
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || 'Login failed'
        });
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
        res.status(401).json({
            success: false,
            message: error.message || '2FA verification failed'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

