require('dotenv').config();
const { AuthUtils } = require('./AuthUtils');

exports.handler = async (event, context) => {
    try {
        const authUtils = new AuthUtils();
        const logoutCookie = authUtils.generateLogoutCookie();
        return {
            statusCode: 302,
            headers: {
                Location: `/`,
                'Cache-Control': 'no-cache',
                'Set-Cookie': logoutCookie,
            },
            body: JSON.stringify({ msg: `Logout successful` }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 302,
            headers: {
                Location: '/',
                'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({ msg: `Logout failed` }),
        };
    }
};
