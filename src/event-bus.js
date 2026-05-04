'use strict';

const EventEmitter = require('events');

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

const MAX_HISTORY = 300;
const history = [];

function emit(type, data) {
  const event = { type, data, timestamp: new Date().toISOString() };
  history.push(event);
  if (history.length > MAX_HISTORY) history.shift();
  emitter.emit('event', event);
}

function subscribe(callback) {
  emitter.on('event', callback);
  return () => emitter.off('event', callback);
}

function getHistory() {
  return [...history];
}

module.exports = { emit, subscribe, getHistory };
