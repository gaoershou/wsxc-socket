var express = require('express');
var path = require('path');
var router = express.Router();
var app = express();
var fs = require('fs');
var url = require('url');
var glob = require('glob');
var md5 = require('md5-node')
var sha1 = require('sha1');
var querystring = require('querystring');
var bodyParser = require('body-parser'); //接收post依赖的中间件
var cookieParser = require('cookie-parser'); //引入 cookie-parser
var session = require('express-session');
var request = require('request');
var http = require('http');
var superagent = require('superagent');
var uuid = require('node-uuid');
require('superagent-proxy')(superagent);

app.use(cookieParser('sessiontest'));
app.use(session({
    secret: 'sessiontest',// 与cookieParser中的一致
    resave: true,
    saveUninitialized:true
}));

var mysqlDb = require(__dirname + "/../common/config/db/db.js");
var redisDb = require(__dirname + "/../common/config/db/redis.js");

var chatWebsocketModel = {};
var userSockets = {}; // 用户socket对象集合

// 连接socket
chatWebsocketModel.conSocket = function(wss)
{
    wss.on('connection', function connection(ws) {
        console.log('websocket connection success');

        ws.on('message', function incoming(messageData) {
            if (!messageData || messageData == 'undefined' || messageData == ''){
                return false;
            }
            var messageData = JSON.parse(messageData);
            var emitname = messageData.emitname; // 发送类型
            console.log('客户端发送过来的数据：',messageData);

            switch (emitname) {
                // 用户映射到socket全局对象中
                case 'mappingUserSocket':
                    var userid = messageData.userid;
                    console.log('用户userID-' + userid + '保存到全局socket对象');
                    userSockets[messageData.userid] = ws;
                break;

                // 用户一对一聊天
                case 'singleChat':
                    var touserid = messageData.touserid;
                    var userid = messageData.userid;
                    var machineid = messageData.machineid;
                    var muserid = messageData.muserid;
                    var userSocket = userSockets[touserid];

                    // 在线时socket发送消息
                    if (userSocket) {
                        console.log('用户userID-' + touserid + '在线');
                        messageData.emitname = 'singleChat';
                        userSocket.send(JSON.stringify(messageData)); // 发送消息
                        sortUserChatList(userid, touserid, machineid, muserid);
                    }else{
                        console.log('用户userID-' + touserid + '未在线');
                    }

                    // 统计未读消息
                    // saveNoReadChartNum(userid, );

                    /**
                     *  数据存储设计
                     *  聊天记录:
                     *      各自存储策略,资源拥有而不占有,异步存储策略
                     *
                     *  沟通列表：
                     *      表一：【我联系的记录表】 wsxc_contact_record_myself:userId2 采用有序集合存储。 记录score值为当前时间，value为四要素json字符串
                     *      表二：【联系我的记录表】 wsxc_contact_other:userId2 存储方式同表二。
                     * */
                    var chatHistoryTableSelf = 'wsxc_chathistory:userid' + userid+'_touserid'+touserid+'_machineid'+machineid+'';
                    var chatHistoryTableOther = 'wsxc_chathistory:userid' + touserid+'_touserid'+userid+'_machineid'+machineid+'';
                    var score = Date.now();
                    var historyData = JSON.stringify(messageData);

                    redisDb.zaddPromise(chatHistoryTableSelf, score, historyData);
                    redisDb.zaddPromise(chatHistoryTableOther, score, historyData);

                    var contactSelfTable  = 'wsxc_contact_record_myself:userId'+userid+'';  //  我联系的
                    var contactOtherTable = 'wsxc_contact_record_other:userId'+touserid+''; //  对方的联系我的
                    var contactOtherTable2 = 'wsxc_contact_record_other:userId'+userid+'';  //  我的联系我的

                    var contactData = {
                        userid : messageData.userid,
                        touserid : messageData.touserid,
                        machineid : messageData.machineid,
                        muserid : messageData.muserid
                    }
                    var otherData = {
                        userid : messageData.touserid,
                        touserid : messageData.userid,
                        machineid : messageData.machineid,
                        muserid : messageData.muserid
                    }

                    redisDb.zaddPromise(contactSelfTable, score, JSON.stringify(contactData));
                    redisDb.zaddPromise(contactOtherTable, score, JSON.stringify(contactData));
                    redisDb.zaddPromise(contactOtherTable2, score, JSON.stringify(otherData));

                break;

                // 用户沟通列表排序
                case 'sortUserChatList':

                break;
                // 给同组用户广播
                case 'roomChat':

                break;

                // 给全部用户广播消息
                case 'broadcast':
                    wss.clients.forEach(function each(client) {
                        client.send('广播发送：' + JSON.stringify(messageData));
                    });
                break;
                default:
                break;
            }

        });

        ws.send('连接成功');

    });
}

function sortUserChatList(userid, touserid, machineid, muserid){
    var listValue = {
        emitname  : 'sortUserChatList',
        userid    : userid,
        touserid  : touserid,
        machineid : machineid,
        muserid   : muserid
    }

    var socket = userSockets[touserid];

    socket.send(JSON.stringify(listValue));
}

// function saveNoReadChartNum(userid, value, type='myself'){
//     if (type == 'myself') {
//         let table = 'wsxc_myself_noread_nums_userid'+userid;
//         let score = Date.now();
//         let data = value;
//         value.nums =  value.num++;
//         redisDb.zaddPromise(table, score, JSON.stringify(data));

//     } else {

//     }
// }

// 生成随机字符串
function randomString(len) {
    len = len || 16;
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxLen = $chars.length;
    var str = '';
    for (i = 0; i < len; i++) {
        str += $chars.charAt(Math.floor(Math.random() * maxLen));
    }
    return str;
}

// 字典序排序并生成字符串
function rawString(args) {
    var keys = Object.keys(args);
    var newArgs = {};
    keys = keys.sort()

    keys.forEach(function(key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';

    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
    }

    string = string.substr(1);

    return string;
};

module.exports = chatWebsocketModel;
