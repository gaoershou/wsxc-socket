let logInfo = {};

logInfo.LOG_TYPE_ERROR = 'error';
logInfo.LOG_TYPE_RESULT = 'result';
logInfo.LOG_TYPE_ARGUEMENT = 'arguement'

logInfo.log = (route,type,info) => {
    console.log(route,type,JSON.stringify(info))
}

module.exports = logInfo;