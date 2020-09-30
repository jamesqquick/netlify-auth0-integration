const { Issuer } = require('openid-client');
const { generators } = require('openid-client');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const getIssuer = async () => {
    //TODO: can we cache anything
    //TODO: can we create a new Issuer manually instead of calling out?
    return await Issuer.discover(`https://${process.env.AUTH0_DOMAIN}`);
};

const getOpenIdClient = async () => {
    const issuer = await getIssuer();
    return new issuer.Client({
        client_id: process.env.AUTH0_CLIENT_ID,
        redirect_uris: [
            `${process.env.APP_DOMAIN}/.netlify/functions/callback`,
        ],
        response_types: ['id_token'],
    });
};

const generateNetlifyJWT = async (tokenData) => {
    const namespace = 'https://netlify-integration.com';
    tokenData['app_metadata'] = {
        authorization: {
            roles: tokenData[`${namespace}/roles`],
        },
    };
    return await jwt.sign(tokenData, 'test'); //TODO: use secret from environment variables
};

const generateAuth0LoginCookie = (nonce, encodedStateStr) => {
    const cookieData = { nonce, state: encodedStateStr };
    const tenMinutes = 10 * 60 * 1000;

    const loginCookie = cookie.serialize(
        'auth0_login_cookie',
        JSON.stringify(cookieData),
        {
            secure: true,
            path: '/',
            maxAge: tenMinutes,
            httpOnly: true,
        }
    );
    return loginCookie;
};

const getEncodedStateString = (route) => {
    const state = { route, nonce: generators.nonce() };

    //convert the state object to a base64 string
    const stateBuffer = Buffer.from(JSON.stringify(state));
    const encodedStateStr = stateBuffer.toString('base64');

    return encodedStateStr;
};

const getRedirectURL = async (nonce, encodedStateStr) => {
    const openIDClient = await getOpenIdClient();

    const authorizationUrl = openIDClient.authorizationUrl({
        scope: 'openid email profile',
        response_mode: 'form_post',
        nonce,
        state: encodedStateStr,
    });
    return authorizationUrl;
};

module.exports = {
    getOpenIdClient,
    generators,
    generateNetlifyJWT,
    generateAuth0LoginCookie,
    getRedirectURL,
    getEncodedStateString,
    generateAuth0LoginCookie,
};
