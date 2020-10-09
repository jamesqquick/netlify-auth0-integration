require('dotenv').config();
const { AuthUtils } = require('./AuthUtils');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    try {
        if (!event.headers.cookie) {
            throw new Error(
                'No login cookie present for tracking nonce and state.'
            );
        }
        const authUtils = new AuthUtils();
        await authUtils.initializeClient();

        const { auth0_login_cookie: loginCookie } = cookie.parse(
            event.headers.cookie
        );
        const { nonce, state } = JSON.parse(loginCookie);

        const params = authUtils.getCallbackParams(event);

        const tokenSet = await authUtils.openIDClient.callback(
            `${process.env.APP_DOMAIN}/.netlify/functions/callback`,
            params,
            {
                nonce,
                state,
            }
        );
        const { id_token } = tokenSet;
        console.log(id_token)
        const decodedToken = jwt.decode(id_token);
        const netlifyCookie = await authUtils.generateNetlifyCookieFromAuth0Token(
            decodedToken
        );

        const auth0LoginCookie = authUtils.generateAuth0LoginCookieReset();
        return {
            statusCode: 302,
            headers: {
                Location: `/`,
                'Cache-Control': 'no-cache',
            },
            multiValueHeaders: {
                'Set-Cookie': [netlifyCookie, auth0LoginCookie],
            },
            body: JSON.stringify({ msg: `you're good` }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 302,
            headers: {
                Location: '/',
                'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({ msg: `Callback failed` }),
        };
    }
};
