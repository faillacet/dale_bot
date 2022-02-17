class HelperFunctions {
    constructor() {
        this.userMuted = [];
        this.reactUser = [];
        this.adminList = ['173944478770397186', '201177301264629760'];
    }

    // Format Bot Msg to be in tripple backticks
    boxFormat(string) {
        return "```\n" + string + "\n```";
    }

    inList(item, list) {
        for (const element of list) {
            if (element == item) {
                return true;
            }
        }
        return false;
    }

    // return -1 if not in list
    inListIndex(item, list) {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === item) {
                return i;
            }
        }
        return -1;
    }

    emoteSpam(msg) {
        for (let i = 0; i < 10; i++) {
            msg.channel.send(":raeW:");
        }
    }

    addReactUser(msg, cmd) {
        let tag = msg.toString().substr(cmd.length + 1, msg.content.length);
        if (this.inList(msg.author.id, this.adminList)) {
            let index = this.inListIndex(tag, this.reactUser);
            // not in list
            if (index === -1) {
                this.reactUser.push(tag);
            }
            // in list
            else {
                this.reactUser.splice(index, 1);
            }
        }
        else {
            msg.channel.send(Helper.boxFormat("You do not have perms for this command."));
        }
    }

    muteUser(msg, cmd) {
        let tag = msg.toString().substr(cmd.length + 1, msg.content.length);
        if (this.inList(msg.author.id, this.adminList)) {
            let index = this.inListIndex(tag, this.userMuted);
            // not in list
            if (index === -1) {
                this.userMuted.push(tag);
            }
            // in list
            else {
                this.userMuted.splice(index, 1);
            }
        }
        else {
            msg.channel.send(Helper.boxFormat("You do not have perms for this command."));
        }
    }
}

const Helper = new HelperFunctions();

module.exports = Helper;