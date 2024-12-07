const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlacklistSchema = new Schema({
    targetId: String,
    addedBy: String
});

module.exports = mongoose.model('blacklist', BlacklistSchema);