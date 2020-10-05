require('dotenv').config();
const { AuthUtils } = require('./AuthUtils');
const { generators } = require('openid-client');

exports.handler = async (event, context) => {
    try {
        const authUtils = new AuthUtils();
        await authUtils.initializeClient();

        //TODO: is referrer the best place to get the path?
        const referrer = event.headers.referrer;
        const encodedStateStr = authUtils.generateEncodedStateString(referrer);

        const nonce = generators.nonce();
        const authRedirectURL = await authUtils.generateAuthRedirectURL(
            nonce,
            encodedStateStr
        );
        const loginCookie = authUtils.generateAuth0LoginCookie(
            nonce,
            encodedStateStr
        );

        return {
            statusCode: 302,
            headers: {
                Location: authRedirectURL,
                'Cache-Control': 'no-cache',
                'Set-Cookie': loginCookie,
            },
            body: '',
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Login failed' }),
            headers: {
                Location: '/',
            },
        };
    }
};
