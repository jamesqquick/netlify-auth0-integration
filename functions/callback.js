const qs = require('querystring');
const { getClient } = require('./auth');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    console.log(event.headers.cookie);
    try {
        if (!event.headers.cookie) {
            throw new Error(
                'No login cookie present for tracking nonce and state.'
            );
        }
        const { auth0_login_cookie: loginCookie } = cookie.parse(
            event.headers.cookie
        );
        const { nonce, state } = JSON.parse(loginCookie);
        const client = await getClient();

        //TODO: does mocking out this request object make sense?
        const req = {
            method: 'POST',
            body: event.body,
            url: event.headers.host,
        };
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            `${process.env.APP_DOMAIN}/.netlify/functions/callback`,
            params,
            {
                nonce,
                state,
            }
        );
        const { id_token } = tokenSet;
        const tokenData = jwt.decode(id_token);
        //TODO: get namespace from environment variables
        const namespace = 'https://netlify-integration.com';
        tokenData['app_metadata'] = {
            authorization: {
                roles: tokenData[`${namespace}/roles`],
            },
        };
        console.log(tokenData);

        //TODO: clear login cookie
        //TODO: decode the token and build netlify token
        //TODO: set cookie with netlify token
        const twoWeeks = 14 * 24 * 3600000;
        const netlifyCookie = cookie.serialize(
            'nf_jwt',
            JSON.stringify(tokenData),
            {
                // secure: true,
                path: '/',
                maxAge: twoWeeks,
            }
        );
        return {
            statusCode: 302,
            headers: {
                Location: `${process.env.APP_DOMAIN}`,
                'Cache-Control': 'no-cache',
                'Set-Cookie': netlifyCookie,
            },
            body: JSON.stringify({ msg: `you're good` }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 302,
            headers: {
                Location: 'https://ea5f65a88bbc.ngrok.io/',
                'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({ msg: `something went wrong` }),
        };
    }
};
