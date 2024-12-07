const antiCrash = {
    name: 'AntiCrash Plugin',
    version: '1.0.0',
    author: 'glaxin1772',
    initialize: (client) => {
        process.on('unhandledRejection', (reason, promise) => {
            client.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        process.on('uncaughtException', (err) => {
            client.logger.error('Uncaught Exception thrown:', err);
        });
    },
};

module.exports = antiCrash;