const { connect, connection } = require('mongoose');
const config = require('../config.js');
const { uri } = config.mongodb;
const Logger = require('../structures/Logger.js');
const logger = new Logger();

module.exports = async () => {
    await connect(uri).then(() => {
        logger.success(`[DB] Successfully connected to mongodb! (${connection.name})`)
    });
}