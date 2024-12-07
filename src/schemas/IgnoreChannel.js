const mongoose = require('mongoose')

const ignoremodule = mongoose.Schema({
  channelIds: {
    type: mongoose.SchemaTypes.Array,
    required: true,
  },
  guildId: {
    type: mongoose.SchemaTypes.String,
    required: true
  },
  addedBy: {
    type: mongoose.SchemaTypes.String,
    required: true
  },
})
module.exports = mongoose.model('ignore-channel', ignoremodule);