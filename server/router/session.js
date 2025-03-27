const express = require('express');
const { create, getSessionData } = require('../controller/session');
const Router = express.Router();

Router.post('/create-session', create);
Router.get('/restore/:sessionId', getSessionData);

module.exports = Router;