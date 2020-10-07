require('dotenv').config();
const { AuthUtils } = require('./AuthUtils');

exports.handler = async (event, context) => {
    try {
        const authUtils = new AuthUtils();
        const logoutCookie = authUtils.generateLogoutCookie();
        return {
            statusCode: 302,
            headers: {
                Location: `https://${process.env.AUTH0_DOMAIN}/v2/logout?returnTo=${process.env.APP_DOMAIN}&client_id=${process.env.AUTH0_CLIENT_ID}`,
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
