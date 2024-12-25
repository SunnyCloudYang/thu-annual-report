const express = require('express');
const path = require('path');
const { InfoHelper } = require('@thu-info/lib');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const fs = require('fs');
const NodeRSA = require('node-rsa');

// Private key should be stored securely and loaded from environment
const PRIVATE_KEY = process.env.PRIVATE_KEY || `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDflbIqrAT7IZm
8GtBRqKSkNwhATBjJb4YbQfkl8/y9M9POq8LWM5z08IloFsIRhDsjSOlAyDzSsuo
7/g+TKfD2RtAQz5MICBV8BF2Y9lHzD6fPMzTz/ENJHpphZKKndI07mNemHdCBucQ
v6bnRlw0vZ3UVAW0AOw7ToJE1cpdLZXM9yglGC2NV7xU9HmeeK8EspwfIoSnIizB
ngAx3eetDb67HzosXTsnZWNNKo4Cyc+otdG1R3ocRj0SbjdBrbBg6k0Jt6hs8j0D
+klej2fTD64Ko/TfbZg2QR0Z5ccEu4kOBx95SZEXbdlApudkDZZc/DCtWDJGiDDq
NmPVKW+VAgMBAAECggEAJXMN1+oOyfpM8upKeZo46X/Tk4UBSnT/+fjlAq7sWJv6
HLDeuHs+LWUa849I8QhPFKmi8ujrBoBFDGtP8EtJ9hQgisp25ClhWGUhSz8sb/sZ
4fJJQKg8gqqCwrUiUeiSzK4AHi5x5hWhbQ1xwSsy3a2XTwX7g7SLjH7pKJuV5QxR
QcTxLu9LF6OyrOGw2Ak96oR662QHqbjYFOtcZ3Z5251poQkz0Gundpr+2yTzkk9u
7SHaf7MAqX9sgE6G8lBWEqki+hFHHY7XlVvWs4FyFYlcHLO0bJqxdWUNXAwDcy1W
RIKR0hjjS5zRc9r3kH8AkzROg5OVGFC9ESQnEX5VQQKBgQDlW54wMk8eg7JBKPP5
AmnF/D2HvlyjpzehbV1ykXKPrg0LtTmFVqRLliraQbroJyCqM4D814hwlbbZAaTc
iW6agO4Jar6naBZ9jtko5/O7V1oL1mYxlHgGwEmUzt87v8ujTUCqPsK7MewkQkV0
+1lDKLnZpK9PBjc7amAAKXeuoQKBgQDaM7OBh5Rl74o2Olwqe7IhvEIIIsPB06Wg
WNIo0RCQ9O8ocjp5qEqsX5PB4cqOoy//fQARHu0k8QKUh88Ma9CZPqBb0jCd8Sa5
GgNtC5UbIsj7UnRTrQSDex2OfWy76yY11PxyYXL01wlwYmFWHfrYnm2Df73jFHqR
xNtZrRKgdQKBgGTv/xwi5+L7/nTiuww5Xad+LO4Sft6e9sKaSOfkztAgvykJ5nih
+sgxHEbVapZEsgF1jSy5BhjWKpQyPwW3je99EkUery0ph8xWE4gHHKKz/LL89hiX
yILgGQHeUSwQamRB2VWTLUwI2m3SpJKpE02VHMWFzokuqRwC4qDvnvZBAoGBAMLf
XbeXAF+xePxJTrraUhJy8X4WnkHi5Y65BKhTXro3Jcg3jCXOuTINAgcrwh11fI5u
crrXpe9SF33TdIShXWEfX1Ph+m10S6MQqnKe34GmpVxfHWkFonxSXek99vg1YKC/
IN5+TY6A5fsqwceJatg/VYsVcN73EShSaZxDR9lpAoGAG+T88Mv9a0SvaVTsCp1Y
uApkQ9eMqbLfiKtcAlGaJYc4LT/Rt2wNX/Oi/RaZKk0Yx4Tc++znPs71+OfSZ8R3
cA0Ok2S+mS2wFtlH7Gkuy/Z621fPUahQG1wmrm9lJxXLwL1FIKwywYEEpLUB6art
O46TSXyh9GtHQy8INT9p6Ek=
-----END PRIVATE KEY-----`;

const key = new NodeRSA(PRIVATE_KEY);

const decrypt = (ciphertext) => {
    return key.decrypt(ciphertext, 'utf8');
};

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
        const { userId: encryptedUserId, password: encryptedPassword, twoFactorMethod } = req.body;
        
        // Decrypt credentials using private key
        const userId = decrypt(encryptedUserId);
        const password = decrypt(encryptedPassword);
        
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
            !res.headersSent && res.status(202).json({
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
