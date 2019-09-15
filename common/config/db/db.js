// mysql 数据库配置
var mysql = require('mysql');
var mysqlDb = {};
var pool = mysql.createPool({
    // 本地数据库配置
    // host: '127.0.0.1',
    // user: 'root',
    // password: '123456',
    // database: 'gpquan'


});

mysqlDb.query = function (sql) {
    return new Promise((reslove, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reslove(err);
                return;
            }

            connection.query(sql, function (error, result) {
                if (error) {
                    // reject(error);
                    console.log('mysql数据库错误:', error)
                    reslove('error');
                } else {
                    // console.log('mysql.result:',result);
                    reslove(result);
                }

                connection.release();//释放链接
            });

        });
    })
}

// exports.query = query;
module.exports = mysqlDb;
