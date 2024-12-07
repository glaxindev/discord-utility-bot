const mongoose = require('mongoose')

const ignorebypass = mongoose.Schema({
  guildId: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  userIds: {
    type: mongoose.SchemaTypes.Array,
    required: true,
  },
  addedBy: {
    type: mongoose.SchemaTypes.String,
    required: true
  },
})
module.exports = mongoose.model('ignore-bypass', ignorebypass);