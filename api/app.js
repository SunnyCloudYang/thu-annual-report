const express = require('express');
const path = require('path');
const { InfoHelper } = require('@thu-info/lib');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const fs = require('fs');
const app = express();

const helper = new InfoHelper();

// API routes come first
app.use('/api', express.json());  // Apply JSON parsing only to API routes

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
            // Return early with 2FA required status
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
            return true;
        };

        try {
            await helper.login({
                userId,
                password,
            });
            
            // Only reach here if 2FA was not required
            res.status(200).json({ 
                success: true,
                message: 'Login successful'
            });
        } catch (error) {
            // Only send error response if we haven't already sent 2FA response
            if (!res.headersSent) {
                res.status(401).json({
                    success: false,
                    message: error.message || 'Login failed'
                });
            }
        }
    } catch (error) {
        // Only send error response if we haven't already sent 2FA response
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
        res.status(401).json({
            success: false,
            message: error.message || '2FA verification failed'
        });
    }
});

app.get('/api/getBookingRecordsStats/', async (req, res) => {
    try {
        const bookingRecord = await helper.getBookingRecords();
        res.status(200).json({
            success: true,
            bookingRecord
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || 'Failed to get booking record'
        });
    }
});

app.get('/api/getBankPaymentStats/', async (req, res) => {
    try {
        const bankPayment = await helper.getBankPayment();
        res.status(200).json({
            success: true,
            bankPayment
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || 'Failed to get bank payment'
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
