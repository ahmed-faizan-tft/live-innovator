const express = require('express');
const { authentication } = require('../controller/user');
const Router = express.Router();

Router.post('/auth', authentication);

module.exports = Router;