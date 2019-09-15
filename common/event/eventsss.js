let event = require('events');

let eventObject = new event.EventEmitter();

const callback = (stream) => {
    console.log('someone connected!');
  };

eventObject.on('test',function(){
    console.log('test1');
});
eventObject.on('test',function(){
    console.log('test2');
})
eventObject.on('test',callback);
eventObject.emit('test');



eventObject.removeListener('test',callback);

eventObject.emit('test');
