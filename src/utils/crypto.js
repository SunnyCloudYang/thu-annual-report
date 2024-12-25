import JSEncrypt from 'jsencrypt';

// Public key should be injected via environment variable
const PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwHSvtdY4mxujKyRd6KS9
IMmXscqW3ftrjGdH1LA+/SJOhlgnCL8YcEvRJ3u8dtwvbU3n/kOgFJqwqXWEc5gY
/dIs/qe15r4ecHW8KoqwnJbp2njehEPcvGt5ONfUU2SURzuVnStQIuXceOwSLlqm
qHvseTNEq+yYuemqr7DkjtJgevJ5p+sGBSawAJrRPYbs1I1ZET2WaPXxf2N14v6d
5kkKh5IikFPXNDVHjPCOZoEi17qEbh2fJqRbf8Nx0HA2ScjAizpDLbYTroWgr7vZ
8iIUGxFLSmgNUopeNycfM6sIRqh0mM78CzImiw/WyHiFIiKnUhoXJU0eN6nro42W
DwIDAQAB
-----END PUBLIC KEY-----`;

const encryptor = new JSEncrypt();
encryptor.setPublicKey(PUBLIC_KEY);

export const encrypt = (text) => {
    // JSEncrypt uses PKCS#1 v1.5 padding by default
    return encryptor.encrypt(text);
};
