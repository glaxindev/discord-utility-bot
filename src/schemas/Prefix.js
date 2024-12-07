// make a custom prefix schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrefixSchema = new Schema({
    guildID: String,
    prefix: String,
});

module.exports = mongoose.model('Prefix', PrefixSchema);