'use strict';

const EventEmitter = require('events');

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

const MAX_HISTORY = 300;
const history = [];
const state = {
  appConnected: false,
  appConnectedAt: null,
  appConnectionSource: '',
};

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

function markAppConnected(source) {
  if (!state.appConnected) {
    state.appConnected = true;
    state.appConnectedAt = new Date().toISOString();
  }
  state.appConnectionSource = source || state.appConnectionSource || 'webhook';
  emit('app.connected', {
    source: state.appConnectionSource,
    connectedAt: state.appConnectedAt,
  });
}

function getState() {
  return { ...state };
}

module.exports = { emit, subscribe, getHistory, markAppConnected, getState };
