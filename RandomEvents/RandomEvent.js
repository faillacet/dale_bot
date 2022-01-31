class RandomEvent {
    constructor() {
        this.daleMsgArr = require("./storedMsgs/randomDaleMsg.js");
        this.trantMsgArr = require("./storedMsgs/randomTrantMsg.js");
    }

    // Pick random msg from msg array
    printRandomDaleMsg(msg) {
        const x = Math.floor(Math.random() * this.daleMsgArr.length);
        msg.channel.send(this.daleMsgArr[x]);
    }   

    printRandomTrantMsg(msg) {
        const x = Math.floor(Math.random() * this.trantMsgArr.length);
        msg.channel.send(this.trantMsgArr[x]);
    }
}

const RandEvent = new RandomEvent();

module.exports = RandEvent;