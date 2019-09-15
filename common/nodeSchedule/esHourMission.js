let mission = require('node-schedule');

let test = () => {
    mission.scheduleJob('4 * * * * *',function() {
        console.log(111);
        
    })
}

test()