const express = require('express');
const router = express.Router();
const { processDocs } = require('../controllers/document.controller');

router.get('/documents', processDocs); // POST /documents/process

module.exports = router;

