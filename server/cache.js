const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

function set(key, value, ttl = 60) {
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
