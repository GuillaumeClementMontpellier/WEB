"use strict"

const express = require('express')
const app = express.Router()

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
		return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a]
	})
}


//get database demands
app.get('/name/:name', userByName)
app.get('/id/:id', userById)

function userByName(req, res, next) {

	if(typeof req.params.name !== 'string') {
		return next({status: 400, message: 'invalid input'})
	}

	let q = `SELECT id_user FROM user_profile WHERE name_user=$1`

	let par = [escapeHtml(req.params.name)]

	pool.query(q, par, function(err,result) {    
		if(err || result == undefined || result.rows == undefined){
			return next({status: 400, message: 'invalid input'})
		}
		res.status(200)
		res.json(result.rows[0])
	})
}

function userById(req, res, next) {

	if(typeof req.params.id !== 'string') {
		return next({status: 400, message: 'invalid input'})
	}

	let q = `SELECT name_user FROM user_profile WHERE id_user=$1`

	let par = [escapeHtml(req.params.id)]

	pool.query(q, par, function(err,result) {    
		if(err || result == undefined || result.rows == undefined){
			return next({status: 400, message: 'invalid input'})
		}
		res.status(200)
		res.json(result.rows[0])
	})
}


//get specifiques infos
app.get('/comments/:id', commentsOfUser)
app.get('/comments', commentsOfUser)
app.get('/likes/:id', likesOfUser)
app.get('/likes', likesOfUser)
app.get('/replys/:id', replyToUser)
app.get('/replys', replyToUser)
app.get('/likedcomments/:id', likedComments)
app.get('/likedcomments', likedComments)

function commentsOfUser(req, res, next) { //  avec nbr, limit et offset

	if(!req.query) {
		return next({status: 400, message: 'invalid input'})
	}
	if(typeof req.query.nbr !== 'string') {
		return next({status: 400, message: 'invalid input query'})
	}
	if(typeof req.params.id !== 'string') {
		if(!req.signedIn){
			return next({status: 400, message: 'invalid input param'})
		} else {
			req.params.id = req.signedCookies.user_id
		}
	}

	let q = `SELECT comment_id, contenu, created, edited, author_id, name_user FROM commentaire, user_profile
	WHERE author_id=id_user AND author_id = $1 AND comment_id NOT IN (select id_reply from reply_to)
	ORDER BY score(comment_like_count(comment_id)+1,comment_dislike_count(comment_id)) LIMIT $2`

	let par = [escapeHtml(req.params.id),escapeHtml(req.query.nbr)]

	if(typeof req.query.offset === 'string'){
		q += 'OFFSET $3'
		par.push(escapeHtml(req.query.offset))
	}

	if(req.query.desc){
		q.replace('LIMIT', 'DESC LIMIT')
	}

	pool.query(q, par, function(err,result) {    
		if(err || result == undefined || result.rows == undefined){
			return next({status: 400, message: 'invalid input'})
		}
		res.status(200)
		res.json(result.rows)
	})
}

function likesOfUser(req, res, next) { //retourne les cartes liked par cet user
	if(!req.query) {
		return next({status: 400, message: 'invalid input'})
	}
	if(typeof req.query.nbr !== 'string') {
		return next({status: 400, message: 'invalid input'})
	}
	if(typeof req.params.id !== 'string') {
		if(!req.signedIn){
			return next({status: 400, message: 'invalid input param'})
		} else {
			req.params.id = req.signedCookies.user_id
		}
	}

	let q = 'SELECT var_id, image_url FROM carte_var, carte_like cl WHERE var_id = cl.carte_id AND user_id = $1 AND aime=true ORDER BY score(carte_like_count(var_id)+1,carte_dislike_count(var_id)) LIMIT $2'
	let par = [escapeHtml(req.params.id),escapeHtml(req.query.nbr)]

	if(typeof req.query.offset === 'string'){
		q += 'OFFSET $3'
		par.push(escapeHtml(req.query.offset))
	}

	if(req.query.desc){
		q.replace('LIMIT', 'DESC LIMIT')
	}

	pool.query(q, par, function(err,result) {    
		if(err || result == undefined || result.rows == undefined){
			return next({status: 400, message: 'invalid input'})
		}
		res.status(200)
		res.json(result.rows)
	})
}

function replyToUser(req, res, next) { //  avec nbr, limit et offset

	if(!req.query) {
		return next({status: 400, message: 'invalid input'})
	}
	if(typeof req.query.nbr !== 'string') {
		return next({status: 400, message: 'invalid input query'})
	}
	if(typeof req.params.id !== 'string') {
		if(!req.signedIn){
			return next({status: 400, message: 'invalid input param'})
		} else {
			req.params.id = req.signedCookies.user_id
		}
	}

	let q = `SELECT c_r.comment_id, c_r.contenu, c_r.created, c_r.edited, c_r.author_id, name_user FROM commentaire c_u, reply_to, commentaire c_r, user_profile
	WHERE c_r.author_id=id_user AND c_u.author_id = $1 AND c_r.comment_id = id_reply AND c_u.comment_id = id_comment
	ORDER BY score(comment_like_count(c_r.comment_id)+1,comment_dislike_count(c_r.comment_id)) LIMIT $2`

	let par = [escapeHtml(req.params.id),escapeHtml(req.query.nbr)]

	if(typeof req.query.offset === 'string'){
		q += 'OFFSET $3'
		par.push(escapeHtml(req.query.offset))
	}

	if(req.query.desc){
		q.replace('LIMIT', 'DESC LIMIT')
	}

	pool.query(q, par, function(err,result) {    
		if(err || result == undefined || result.rows == undefined){
			return next({status: 400, message: 'invalid input'})
		}
		res.status(200)
		res.json(result.rows)
	})
}

function likedComments(req, res, next) { //retourne les comments liked par cet user

	if(!req.query) {
		return next({status: 400, message: 'invalid input'})
	}
	if(typeof req.query.nbr !== 'string') {
		return next({status: 400, message: 'invalid input'})
	}
	if(typeof req.params.id !== 'string') {
		if(!req.signedIn){
			return next({status: 400, message: 'invalid input param'})
		} else {
			req.params.id = req.signedCookies.user_id
		}
	}

	let q = `SELECT c.comment_id, contenu, created, edited, author_id, name_user FROM commentaire c, user_profile, comment_like cl
	WHERE author_id=id_user AND c.comment_id = cl.comment_id AND user_id = $1 AND aime=true
	ORDER BY score(c.comment_like_count(comment_id)+1,comment_dislike_count(c.comment_id)) LIMIT $2`
	let par = [escapeHtml(req.params.id),escapeHtml(req.query.nbr)]


	if(typeof req.query.offset === 'string'){
		q += 'OFFSET $3'
		par.push(escapeHtml(req.query.offset))
	}

	if(req.query.desc){
		q.replace('LIMIT', 'DESC LIMIT')
	}

	pool.query(q, par, function(err,result) {    
		if(err || result == undefined || result.rows == undefined){
			return next({status: 400, message: 'invalid input'})
		}
		res.status(200)
		res.json(result.rows)
	})
}

//delete
app.delete('/:id',deleteUser)
app.delete('/',deleteUser)


function deleteUser(req, res, next){

	if(!req.signedIn){
		return next({status: 403, message: 'Pas logged in'})
	}	
	if(!req.signedInAdmin){
		//si pas admin, on ne peut supprimer que son propre compte
		req.params.id = req.signedCookies.user_id
	}	
	if(typeof req.params.id !== 'string') {
		req.params.id = req.signedCookies.user_id		
	}	

	let q1 = `UPDATE commentaire SET author_id = 0 AND contenu = "DELETED" AND edited = now() WHERE author_id = $1`
	let par1 = [escapeHtml(req.params.id)]

	let q2 = `DELETE FROM carte_like where user_id = $1 AND $1 != 0`
	let par2 = [escapeHtml(req.params.id)]

	let q3 = `DELETE FROM comment_like where user_id = $1 AND $1 != 0`
	let par3 = [escapeHtml(req.params.id)]

	let q3 = `DELETE FROM admin where admin_id = $1 AND $1 != 0 `
	let par3 = [escapeHtml(req.params.id)]

	let q4 = `DELETE FROM user_profile where id_user = $1 AND $1 != 0 `
	let par4 = [escapeHtml(req.params.id)]

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
					return next({status: 500, message: 'Problem of transaction'})
				}

				client.query( q2, par2, function(err,result) {  

					if(shouldAbort(err)){
						return next({status: 500, message: 'Problem of transaction'})
					}

					client.query( q3, par3, function(err,result) {  

						if(shouldAbort(err)){
							return next({status: 500, message: 'Problem of transaction'})
						}

						client.query( q3, par3, function(err,result) {  

							if(shouldAbort(err)){
								return next({status: 500, message: 'Problem of transaction'})
							}

							res.status(201)
							res.send()

							client.query('COMMIT', function(err){
								done()
							})

						})
					})
				})
			})
		})
	})
}



module.exports = app