require('dotenv').config();
const { AuthUtils } = require('./AuthUtils');

exports.handler = async (event, context) => {
    try {
        const authUtils = new AuthUtils();
        const logoutCookie = authUtils.generateLogoutCookie();

        const auth0DomainLogout = `https://${process.env.AUTH0_DOMAIN}v2/logout`;
        const urlReturnTo = `returnTo=${encodeURIComponent(
            process.env.APP_DOMAIN
        )}`;
        const urlClientId = `client_id=${process.env.AUTH0_CLIENT_ID}`;
        const logoutUrl = `${auth0DomainLogout}?${urlReturnTo}&${urlClientId}`;
        console.log(logoutUrl);
        return {
            statusCode: 302,
            headers: {
                Location: logoutUrl,
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
