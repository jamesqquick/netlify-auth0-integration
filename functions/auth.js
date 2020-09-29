const { Issuer } = require('openid-client');
const { generators } = require('openid-client');
const jwt = require('jsonwebtoken');
const getIssuer = async () => {
    //TODO: can we cache anything
    //TODO: can we create a new Issuer manually instead of calling out?
    return await Issuer.discover(`https://${process.env.AUTH0_DOMAIN}`);
};

const getClient = async () => {
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
    const expiresIn = Math.floor(Date.now() / 1000) + 60 * 60;
    return await jwt.sign(tokenData, 'test');
};

module.exports = {
    getClient,
    generators,
    generateNetlifyJWT,
};
