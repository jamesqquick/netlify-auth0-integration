require('dotenv').config();
const {
    getRedirectURL,
    generators,
    getEncodedStateString,
    generateAuth0LoginCookie,
} = require('./OpenIdClientUtils');

exports.handler = async (event, context) => {
    try {
        //save the user's current route in the state
        const referrer = event.headers.referrer;
        const encodedStateStr = getEncodedStateString(referrer);

        const nonce = generators.nonce();
        const authorizationUrl = await getRedirectURL(nonce, encodedStateStr);
        const loginCookie = generateAuth0LoginCookie(nonce, encodedStateStr);
        console.log(loginCookie);
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
