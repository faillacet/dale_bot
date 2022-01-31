class HelperFunctions {
    constructor() {
        this.muteDale = false;
    }

    // Format Bot Msg to be in tripple backticks
    boxFormat(string) {
        return "```\n" + string + "\n```";
    }

    fuqDale(msg) {
        // If Command is from verified admin, toggle muteDale
        if (msg.author.id === '173944478770397186' || msg.author.id === '201177301264629760') {
            if (this.muteDale) {
                this.muteDale = false;
                msg.channel.send(boxFormat('No longer fuqing dale...'));
            }
            else {
                this.muteDale = true;
                msg.channel.send(boxFormat('FUQ DALE!!!!'));
            }
        }
    }
}

const Helper = new HelperFunctions();

module.exports = Helper;