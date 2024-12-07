const mongoose = require("mongoose");

// make a afk schema
const afkSchema = mongoose.Schema({
    guildID: String,
    userID: String,
    reason: String,
    timestamp: Number,
    global: Boolean,
});

// export it
module.exports = mongoose.model("afk-schema", afkSchema);