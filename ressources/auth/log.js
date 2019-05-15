"use strict";

const express = require('express')
const router = express.Router()

const { Pool } = require('pg');

//connection a la BD
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

/* GET users listing. */
function checkAuth() {

	return function checkAuth(req, res, next){

		req.signedIn = false;

		if(req.signedCookies.auth && req.signedCookies.user_id){

			let q = 'SELECT code_auth FROM user_profile WHERE user_id=$1';

			pool.query(q, [req.signedCookies.user_id], function(err,result) { 

				if(err || result == undefined || result.rows == undefined){
					return next()
				}

				if(result.rows[0] === req.signedCookies.auth){
					req.signedIn = true;
				}

				return next()

			});			
		}
		next()
	}
}

module.exports = checkAuth;