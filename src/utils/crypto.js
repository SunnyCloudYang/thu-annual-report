import JSEncrypt from 'jsencrypt';

// Public key should be injected via environment variable
const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY || `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw35WyKqwE+yGZvBrQUai
kpDcIQEwYyW+GG0H5JfP8vTPTzqvC1jOc9PCJaBbCEYQ7I0jpQMg80rLqO/4Pkyn
w9kbQEM+TCAgVfARdmPZR8w+nzzM08/xDSR6aYWSip3SNO5jXph3QgbnEL+m50Zc
NL2d1FQFtADsO06CRNXKXS2VzPcoJRgtjVe8VPR5nnivBLKcHyKEpyIswZ4AMd3n
rQ2+ux86LF07J2VjTSqOAsnPqLXRtUd6HEY9Em43Qa2wYOpNCbeobPI9A/pJXo9n
0w+uCqP0322YNkEdGeXHBLuJDgcfeUmRF23ZQKbnZA2WXPwwrVgyRogw6jZj1Slv
lQIDAQAB
-----END PUBLIC KEY-----`;

const encryptor = new JSEncrypt();
encryptor.setPublicKey(PUBLIC_KEY);

export const encrypt = (text) => {
    return encryptor.encrypt(text);
};
