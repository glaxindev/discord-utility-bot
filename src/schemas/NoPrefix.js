const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoPrefixSchema = new Schema({
    targetId: String,
    addedBy: String
});

module.exports = mongoose.model('no-prefix', NoPrefixSchema);