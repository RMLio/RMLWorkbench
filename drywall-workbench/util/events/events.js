const EventEmitter = require('events');
const util = require('util');

function LdfEventEmitter() {
  EventEmitter.call(this);
}
util.inherits(LdfEventEmitter, EventEmitter);

const ldfEventEmitter = new LdfEventEmitter();
ldfEventEmitter.on('restart', function() {
  console.log('Send ldf server restart signal');
});

exports.ldfEventEmitter = ldfEventEmitter;   

