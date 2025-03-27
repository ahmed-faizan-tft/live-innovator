const express = require('express');
const { create, getCode } = require('../controller/join');
const Router = express.Router();

Router.post('/create-join',create );
Router.get('/check/:sessionId/:code',getCode );

module.exports = Router;