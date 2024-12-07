const ticketpanel = require('../schemas/TicketPanel.js');

module.exports = {
    getPanelIdFromChannel: async function(channelId) {
        let data = await ticketpanel.findOne({
            PanelID: channelId
        });
        if(data) {
            return data.PanelID;
        } else {
            return false;
        }
    }
}