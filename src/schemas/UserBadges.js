const { Schema, model } = require("mongoose");

let badges = new Schema({
  UserId: {
    type: String,
    required: true,
  },
  Badges: {
    isDev: {
      type: Boolean,
      default: null,
    },
    isOwner: {
      type: Boolean,
      default: null,
    },
    isPartner: {
      type: Boolean,
      default: null,
    },
    isPremiumUser: {
      type: Boolean,
      default: null,
    },
    isNoPrefixUser: {
      type: Boolean,
      default: null,
    },
    isSupportTeam: {
      type: Boolean,
      default: null,
    },
    isVoter: {
      type: Boolean,
      default: null,
    },
  },
});
module.exports = model("user-badges", badges);