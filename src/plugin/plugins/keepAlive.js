const RhytonClient = require("../../structures/Client.js");

const KeepAlive = {
    name: 'keep-alive',
    version: '1.0.0',
    author: 'glaxin1772',
    /**
     * 
     * @param {RhytonClient} client 
     */
    initialize: (client) => {
        if (client.config.keepAlive) {
            const http = require('node:http');
            const server = http.createServer((req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`I'm alive! Currently serving ${client.guilds.cache.size} guilds.`);
            });
            server.listen(3000, () => {
                client.logger.info('[CLIENT] Keep-Alive server is running on port 3000');
            });
        }
    },
};

module.exports = KeepAlive;