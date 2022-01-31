const DBConnector = require("./DBConnector.js");
const Helper = require("../MiscClasses/HelperFunctions.js");

class DBCommands {
    constructor() {

    }

    async deleteSummoner(msg, cmd) {
        let name = msg.toString().substr(cmd.length + 1, msg.content.length);
        try {
            
            let status = await DBConnector.deleteSummoner(name);
            if (status) {
                msg.channel.send(Helper.boxFormat("Summoner: " + name + " sucessfully deleted."))
            }
            else {
                msg.channel.send(Helper.boxFormat("Summoner not found."));
            }
        }
        catch (e) {
            msg.channel.send(Helper.boxFormat("Error, check logs."));
            console.log(e);
        }
        
    }

    async updateSummoners(msg) {
        try {
            await DBConnector.updateAllSummoners();
            msg.channel.send(Helper.boxFormat('Database Sucessfully Updated.'));
        }
        catch (e) {
            msg.channel.send(Helper.boxFormat('Error, check logs.'));
            console.log(e);
        }
    }
}

const DBCommand = new DBCommands();

module.exports = DBCommand;