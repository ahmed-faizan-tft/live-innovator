const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 2*60*60, checkperiod: 10*60 });

function set(key, value, ttl = 2*60*60) {
  return cache.set(key, value, ttl);
}

function get(key) {
  return cache.get(key);
}

function has(key) {
  return cache.has(key);
}

function del(key) {
  return cache.del(key);
}

function flush() {
  return cache.flushAll();
}

module.exports = { set, get, has, del, flush };
