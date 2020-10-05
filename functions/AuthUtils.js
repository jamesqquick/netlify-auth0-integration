const { Issuer } = require('openid-client');
const { generators } = require('openid-client');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

class AuthUtils {
    constructor() {
        this.openIDClient = null;
    }

    async initializeClient() {
        const issuer = await Issuer.discover(
            `https://${process.env.AUTH0_DOMAIN}`
        );
        this.openIDClient = new issuer.Client({
            client_id: process.env.AUTH0_CLIENT_ID,
            redirect_uris: [
                `${process.env.APP_DOMAIN}/.netlify/functions/callback`,
            ],
            response_types: ['id_token'],
        });
    }

    async generateNetlifyJWT(tokenData) {
        tokenData['app_metadata'] = {
            authorization: {
                roles: tokenData[`${process.env.AUTH0_TOKEN_NAMESPACE}/roles`],
            },
        };
        return await jwt.sign(tokenData, process.env.TOKEN_SECRET);
    }

    generateAuth0LoginCookie(nonce, encodedStateStr) {
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
    }

    generateEncodedStateString(route) {
        const state = { route, nonce: generators.nonce() };
        //convert the state object to a base64 string
        const stateBuffer = Buffer.from(JSON.stringify(state));
        const encodedStateStr = stateBuffer.toString('base64');
        return encodedStateStr;
    }

    async generateAuthRedirectURL(nonce, encodedStateStr) {
        const authorizationUrl = this.openIDClient.authorizationUrl({
            scope: 'openid email profile',
            response_mode: 'form_post',
            nonce,
            state: encodedStateStr,
        });
        return authorizationUrl;
    }

    generateAuth0LoginCookieReset() {
        const auth0LoginCookieReset = cookie.serialize(
            'auth0_login_cookie',
            'Auth0 Login Cookie Reset',
            {
                secure: true,
                httpOnly: true,
                path: '/',
                maxAge: new Date(0),
            }
        );
        return auth0LoginCookieReset;
    }

    generateLogoutCookie() {
        const logoutCookie = cookie.serialize('nf_jwt', 'Logout Cookie', {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: new Date(0),
        });
        return logoutCookie;
    }

    async generateNetlifyCookieFromAuth0Token(tokenData) {
        const netlifyToken = await this.generateNetlifyJWT(tokenData);

        const twoWeeks = 14 * 24 * 3600000;
        const netlifyCookie = cookie.serialize('nf_jwt', netlifyToken, {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: twoWeeks,
        });
        return netlifyCookie;
    }

    getCallbackParams(event) {
        //TODO: does mocking out this request object make sense?

        const req = {
            method: 'POST',
            body: event.body,
            url: event.headers.host,
        };
        const params = this.openIDClient.callbackParams(req);
        return params;
    }
}

module.exports = {
    AuthUtils,
};
