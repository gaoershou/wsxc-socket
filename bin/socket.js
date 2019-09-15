/*
    封装socket服务
    author:jfeng
    createTime:2019.09.02
 */

var socketio = {};
var  WebSocket = require('ws');
var  chatWebsocketModel = require(__dirname + "/../model/chat");

// var db = require(__dirname + "/common/config/db/db.js");
// var redisDb = require(__dirname + "/common/config/db/redis.js");

//socketio封装
socketio.getSocketio = function(socketConfig, server){

    if (socketConfig.ssl == true) {
        // ssl访问
        var wss = new WebSocket.Server({ server });
    } else {
        // 普通模式下访问
        var  wss = new WebSocket.Server({
            port: 8080 // 该端口不能与socketConfig.port的端口相同
        });
    }

    socketio.wss = wss; // socket服务类

    chatWebsocketModel.conSocket(wss);

};

module.exports = socketio;
