let redis = require('redis');
var RDS_PORT = 6379;           //端口号
var RDS_HOST = '120.76.137.40';    //服务器IP
var RDS_OPTS = {auth_pass:'icareer2019'};

// var RDS_HOST = '127.0.0.1';    //服务器IP
// let RDS_OPTS = {};
let client = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS);
client.on('error',(err)=>{
    console.log("redisErr："+err);
})
let redisPormise = {};

//String
redisPormise.get = (key) => {
    return new Promise((reslove,reject) => {
        client.get(key,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })
    })
}

redisPormise.mget = (args) => {
    return new Promise((reslove,reject) => {
        client.mget(args,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })
    })
}

redisPormise.set = (key,value) => {
    return new Promise((reslove,reject) => {
        client.set(key,value,(err,res) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(res);
            }
        })
    })
}

redisPormise.hget = function(table, key){
    return new Promise(function(reslove, reject){
        client.hget(table, key, function(err, result){
            if (err) {
                console.log('hgetPromise: ',err);
                reject(err);
            } else {
                reslove(result);
            }
        });
    })
}
//HASH
redisPormise.hmset = (key,field,args) => {
    return new Promise((reslove,reject) => {
        client.hmset(key,field,args,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result)
            }
        })
    })
}

redisPormise.hmsets = (key,args) => {
    return new Promise((reslove,reject) => {
        client.hmset(key,...args,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result)
            }
        })
    })
}

redisPormise.hmget = (key,args) => {
    return new Promise((reslove,reject) => {
        client.hmget(key,args,(err,result) => {
            if(err){
                console.log(err);
                reject(err)
            }else{
                reslove(result);
            }
        })
    })
}

redisPormise.hexists = (key,field) => {
    return new Promise((reslove,reject) => {
        client.hexists(key,field,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })
    })
}

//SET
redisPormise.sadd = (key,args) => {
    return new Promise((reslove,reject) => {
        client.SADD(key,args,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })
    })
}

redisPormise.smembers = (key) => {
    return new Promise((reslove,reject) => {
        client.SMEMBERS(key,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })
    })
}

//zset
redisPormise.zadd = (key,score,member) => {
    return new Promise((reslove,reject) => {
        client.zadd(key,score,member,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })
    })
}

redisPormise.zrange = (key,start,stop) => {
    return new Promise((reslove,reject) => {
        client.zrange(key,start,stop,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })
    })
}

redisPormise.zrevrange = (key,start,stop) => {
    return new Promise((reslove,reject) => {
        client.zrevrange(key,start,stop,(err,result) => {
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })
    })
}

redisPormise.hincrby = (key,field,value) => {
    return new Promise((reslove,reject) => {
        client.hincrby(key,field,value,(err,result)=>{
            if(err){
                console.log(err);
                reject(err);
            }else{
                reslove(result);
            }
        })

    })
}

// redisPormise.smembersS = async () => {
//     let aa = await redisPormise.hmsets('uid:1111',["age",13,"name",'tom']);
//     console.log(aa);
// }

// redisPormise.smembersS();
module.exports = redisPormise;