"use strict"

const express = require('express')
const router = express.Router()

const sjcl = require("sjcl")

const { Pool } = require('pg')

//connection a la BD
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
})

/* GET home page. */
router.get('/login', function(req, res, next) {

	res.render('login/log_form',{ vue: '', message : false})
	
})

router.get('/signin', function(req, res, next) {

	res.render('login/sign_form',{ vue: '', message : false})
	
})

//log in and out
router.post('/login', login)

router.post('/logout', logout)

router.post('/signin', sign)

// error handler
router.use( function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)

  //res.render('login/log_form',{message : 'Erreur, pas authentifié', vue: '<script src="/ressource/js/login_vue.js"></script>'})
  console.log(err.status + err.message)
  res.redirect('/users')

})


function login(req, res, next){ //post username, mot de passe, qui sont dans body de la request

	if(req.body.user_name && req.body.pass){

		//request enc_pass et salt
		let q = 'SELECT enc_pass, salt, user_id FROM user_profile WHERE user_name=$1 '

		pool.query(q, [req.body.user_name], function(err,result) { 

			if(err || result == undefined || result.rows == undefined){
				return next({status : 400, message : 'Error logging in'})
			}

			//encrypt pass passé en body
			const saltBits = sjcl.codec.base64.toBits(result.rows[0].salt)		
			const derivedKey = sjcl.misc.pbkdf2(req.body.pass, saltBits, 1000, 256)
			const key = sjcl.codec.base64.fromBits(derivedKey)

			//comparaison
			if(result.rows[0].enc_pass = key){

				//genere randoms bits
				const auth = sjcl.random.randomWords(8)
				const auth_code = sjcl.codec.base64.fromBits(saltBits)

				res.cookie('auth', auth_code, {maxAge : 1000*60*60*24, signed: true, secure: true})
				res.cookie('user_id', result.rows[0].id_user, {maxAge : 1000*60*60*24, signed: true, secure: true})
				
				res.redirect('/')

				putAuth(result.rows[0].id_user, auth_code)

				return 

			} 

			res.redirect('/login/login')

			return 

		})		

	}	else {
		next({status : 400, message : 'Error logging in'})
	}

}

function sign(req, res, next){ //post username, mot de passe, date de naissance qui sont dans body de la request

	req.signedIn = false
	req.signedInAdmin = false

	if(req.body.user_name && req.body.pass && req.body.birth_date && req.body.pass_confirm ){

		if(req.body.pass != req.body.pass_confirm) {
			return next({status: 400, message: 'Pas bon mdp Confirmation'})
		}
		if(req.body.pass.length < 10) {
			return next({status: 400, message: 'mdp pas assez long'})
		}

		let q1 = 'Select count(user_name) as n from user_profile where user_name = $1'

		let par1 = [req.body.user_name]

		pool.connect(function (err, client, done){

			const shouldAbort = function(err){
				if (err) {
					client.query('ROLLBACK', function (err) {
						done()
					})
				}
				return !!err
			}

			client.query('BEGIN', function(err){
				if (shouldAbort(err)) {
					return next({status: 500, message: 'Problem of transaction'})
				}
				client.query( q1, par1, function(err,result) {  

					if(shouldAbort(err)){
						return next({status: 500, message: 'Problem of insert'})
					}

					if(result == undefined || result.rows == undefined){
						return next({status: 400, message: 'invalid input'})
					}

					if (res.rows[0].n == 0 ){//si user n'existe pas encore

						const saltBits = sjcl.random.randomWords(8)
	  				const derivedKey = sjcl.misc.pbkdf2(req.body.pass, saltBits, 1000, 256)

	  				const key = sjcl.codec.base64.fromBits(derivedKey)
	  				const salt = sjcl.codec.base64.fromBits(saltBits)

		  			const auth_code_bits = sjcl.random.randomWords(8)
	  				const auth_code = sjcl.codec.base64.fromBits(auth_code_bits)

						//req
						let q = `INSERT INTO user_profile (name_user, enc_pass, salt, code_auth, birth_date) VALUES($1, $2, $3) RETURNING id_user`

						let par = [req.body.user_name, key, salt, auth_code , req.body.birth_date]

						client.query( q, par, function(err,result) {

							if(shouldAbort(err)){
								return next({status: 500, message: 'Problem of insert'})
							}  

							res.status(201)

							res.cookie('auth', auth_code, {maxAge : 1000*60*60*24, signed: true, secure: true})
							res.cookie('user_id', result.rows[0].id_user, {maxAge : 1000*60*60*24, signed: true, secure: true})

							res.redirect('/')

							client.query('COMMIT', function(err){
								done()
							})
						})

					}else{

						client.query('ROLLBACK', function (err) {
							done()
						})

						return next({status: 400, message: 'User existe deja'})

					}
				})
			})
		})
	} else {

		return next({status: 400, message: 'invalid parameters'})

	}
}


function logout(req, res, next){ //post avec cookies auth et user_id

	if(req.signedCookie.user_id ){

		putAuth(req.signedCookie.user_id, null)

		res.clearCookie('auth', { signed: true, secure: true})
		res.clearCookie('user_id', { signed: true, secure: true})

		res.redirect('/')

	}

	res.redirect('/')

}


function putAuth(user_id, auth_code ){

	let q = `UPDATE user_profile SET auth = $1 WHERE user_id = $2`

	let par = [auth_code, user_id]

	pool.connect(function (err, client, done){

		const shouldAbort = function(err){
			if (err) {
				client.query('ROLLBACK', function (err) {
					done()
				})
			}
			return 
		}

		client.query('BEGIN', function(err){
			if (shouldAbort(err)) {
				return 
			}
			client.query( q, par, function(err,result) {  

				if(shouldAbort(err)){
					return 
				}

				if(result == undefined || result.rows == undefined){
					return 
				}

				client.query('COMMIT', function(err){
					done()
				})

			})
		})
	})

}

module.exports = router