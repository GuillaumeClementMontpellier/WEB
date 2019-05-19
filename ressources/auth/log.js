"use strict"

const express = require('express')
const router = express.Router()

const { Pool } = require('pg')

//connection a la BD
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
})

function escapeHtml(text) {
	if(typeof text != 'string'){
		return text
	}
	return text.replace(/[\"&<>]/g, function (a) {
		return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a];
	});
}

/* GET users listing. */
function checkAuth() {

	return function checkAuth(req, res, next){

		req.signedIn = false
		req.signedInAdmin = false
/*
		if(req.originalUrl == '/login/logout'){
			return next()
		}*/

		if(req.signedCookies.auth && req.signedCookies.admin_id){

			console.log('test admin')

			let q = 'SELECT code_auth FROM user_profile, admin WHERE id_user=$1 AND user_id = admin_id'

			pool.query(q, [escapeHtml(req.signedCookies.admin_id)], function(err,result) { 

				console.log('test tente admin')

				if(err || result == undefined || result.rows == undefined){
					return next()
				}

				if(result.rows[0] == req.signedCookies.auth){
					req.signedInAdmin = true
					req.signedIn = true

					console.log('test reussi admin')

					res.cookie('auth',  req.signedCookies.auth, {maxAge : 1000*60*60*24, signed: true, secure: true})
					res.cookie('admin_id', req.signedCookies.admin_id, {maxAge : 1000*60*60*24, signed: true, secure: true})
					res.cookie('user_id', req.signedCookies.user_id, {maxAge : 1000*60*60*24, signed: true, secure: true})
					res.cookie('user_name', req.signedCookies.user_name, {maxAge : 1000*60*60*24, signed: true, secure: true})
				}

				return next()

			})		

		}else if(req.signedCookies.auth && req.signedCookies.user_id){

			let q = 'SELECT code_auth FROM user_profile WHERE id_user=$1'

			pool.query(q, [ escapeHtml(req.signedCookies.user_id)], function(err,result) { 

				if(err || result == undefined || result.rows == undefined || result.rows[0] == undefined){
					return next()
				}

				if(result.rows[0].code_auth == req.signedCookies.auth){
					req.signedIn = true

					res.cookie('auth',  req.signedCookies.auth, {maxAge : 1000*60*60*24, signed: true, secure: true})
					res.cookie('user_id', req.signedCookies.user_id, {maxAge : 1000*60*60*24, signed: true, secure: true})
					res.cookie('user_name', req.signedCookies.user_name, {maxAge : 1000*60*60*24, signed: true, secure: true})
				}

				return next()

			})			
		} else {
			return	next()
		}
	}
}

module.exports = checkAuth
