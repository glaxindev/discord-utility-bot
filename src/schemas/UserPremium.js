const mongoose = require('mongoose')

const user = mongoose.Schema({
  Id: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true
  },
  isPremium: {
    type: mongoose.SchemaTypes.Boolean,
    default: false
  },
  premium: {
    redeemedBy: {
      type: mongoose.SchemaTypes.Array,
      default: null
    },

    redeemedAt: {
      type: mongoose.SchemaTypes.Number,
      default: null
    },

    expiresAt: {
      type: mongoose.SchemaTypes.Number,
      default: null
    },

    plan: {
      type: mongoose.SchemaTypes.String,
      default: null
    },
    billing: {
      type: mongoose.SchemaTypes.String,
      default: null
    },
  },
  guild: {
    isPremium: {
      type: mongoose.SchemaTypes.Boolean,
      default: false
    },
    id: {
      type: mongoose.SchemaTypes.String,
      default: null
    },
    activatedBy: {
      type: mongoose.SchemaTypes.String,
      default: null
    },
  }
})
module.exports = mongoose.model('user-premium', user)