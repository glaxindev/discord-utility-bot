const { ShardingManager } = require('discord.js');
const config = require('./config.js');
const Logger = require('./structures/Logger.js');

const logger = new Logger();

const manager = new ShardingManager('./src/client.js', {
    respawn: true,
    token: config.token,
    totalShards: 'auto',
    shardList: 'auto',
});

manager
    .spawn({ amount: manager.totalShards, delay: null, timeout: -1 })
    .then(shards => {
        logger.start(`[CLIENT] ${shards.size} shard(s) spawned.`);
    })
    .catch(err => {
        logger.error('[CLIENT] An error has occurred :', err);
    });

manager.on('shardCreate', shard => {
    shard.on('ready', () => {
        logger.start(`[CLIENT] Shard ${shard.id} connected to Discord's Gateway.`);
    });
});

// shard disconnect
manager.on('shardDisconnect', (shard, event) => {
    logger.warn(`[CLIENT] Shard ${shard.id} disconnected from Discord's Gateway.)`);
});

// shard reconnecting
manager.on('shardReconnecting', (shard, event) => {
    logger.warn(`[CLIENT] Shard ${shard.id} is reconnecting to Discord's Gateway.)`);
});

// shard resume
manager.on('shardResume', (shard, event) => {
    logger.start(`[CLIENT] Shard ${shard.id} resumed connection to Discord's Gateway.)`);
});

// shard error
manager.on('shardError', (shard, error) => {
    logger.error(`[CLIENT] Shard ${shard.id} encountered an error:`);
});

// shard death
manager.on('shardDeath', shard => {
    logger.error(`[CLIENT] Shard ${shard.id} died.`);
});