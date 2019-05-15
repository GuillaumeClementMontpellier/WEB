"use strict";

const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {

	res.render('login/index',{ vue: '<script src="ressource/js/login_vue.js"></script>'});
	
});

module.exports = router;