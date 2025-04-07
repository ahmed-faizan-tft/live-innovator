const express = require('express');
const { getAllTemplates, getTemplate } = require('../controller/templates');
const Router = express.Router();

Router.get('/get-templates', getAllTemplates);
Router.get('/get-template/:templateId', getTemplate);

module.exports = Router;