const { getClient, generators } = require('./utils/auth');
const cookie = require('cookie');

exports.handler = async (event, context) => {
    const referrer = event.headers.referrer;
    try {
        const client = await getClient();
        const nonce = generators.nonce();
        //todo: throw in a nonce property go
        const state = { route: referrer, nonce: generators.nonce() };
        //TODO: stringify + base 64 encode + url safe
        const stateBuffer = Buffer.from(JSON.stringify(state));
        const stateStr = stateBuffer.toString('base64');
        console.log(stateStr);
        const cookieData = { nonce, state: stateStr };
        const tenMinutes = 10 * 60 * 1000;

        const loginCookie = cookie.serialize(
            'auth0_login_cookie',
            JSON.stringify(cookieData),
            {
                // secure: true,
                path: '/',
                maxAge: tenMinutes,
                // httpOnly: true,
            }
        );
        const authorizationUrl = client.authorizationUrl({
            scope: 'openid email profile',
            response_mode: 'form_post',
            nonce,
            state: stateStr,
        });

        return {
            statusCode: 302,
            headers: {
                Location: authorizationUrl,
                'Cache-Control': 'no-cache',
                'Set-Cookie': loginCookie,
            },
            body: '',
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Something not work' }),
        };
    }
};
