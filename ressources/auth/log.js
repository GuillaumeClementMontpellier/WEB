"use strict"

const express = require('express')
const router = express.Router()

const { Pool } = require('pg')

//connection a la BD
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
})

/* GET users listing. */
function checkAuth() {

	return function checkAuth(req, res, next){

		req.signedIn = false
		req.signedInAdmin = false

		if(req.signedCookies.auth && req.signedCookies.admin_id){

			let q = 'SELECT code_auth FROM user_profile, admin WHERE user_id=$1 AND user_id = admin_id'

			pool.query(q, [req.signedCookies.admin_id], function(err,result) { 

				if(err || result == undefined || result.rows == undefined){
					return next()
				}

				if(result.rows[0] == req.signedCookies.auth){
					req.signedInAdmin = true
					req.signedIn = true
				}

				return next()

			})		

		}else if(req.signedCookies.auth && req.signedCookies.user_id){

			let q = 'SELECT code_auth FROM user_profile WHERE user_id=$1'

			pool.query(q, [req.signedCookies.user_id], function(err,result) { 

				if(err || result == undefined || result.rows == undefined){
					return next()
				}

				if(result.rows[0] == req.signedCookies.auth){
					req.signedIn = true
				}

				return next()

			})			
		}
		next()
	}
}

// error handler
router.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('login/index',{message : Erreur, pas logged in})
})

module.exports = checkAuth
