exports.handler = async (event, context) => {
    console.log('HELLO WORLD!');
    return {
        statusCode: 200,
        body: JSON.stringify({ msg: 'Hello World' }),
    };
};
