"use strict"

const express = require('express')
const app = express.Router()

const { Pool } = require('pg')

//connection a la BD
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
})

//GET
//Specifique
app.get('/:id',detailsComm)
app.get('/reply/:id',listeReply)

function detailsComm(req, res, next) {

  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input'})
  }

  let q = `SELECT comment_id, contenu, created, edited, carte_id, author_id, name_user FROM commentaire, user_profile WHERE comment_id = $1 AND author_id=id_user`

  let par = [req.params.id]

  pool.query(q, par, function(err,result) {    
    if(err || result == undefined || result.rows == undefined){
      return next({status: 400, message: 'invalid input'})
    }
    res.status(200)
    res.json(result.rows)
  })
}

function listeReply(req, res, next) { //  avec nbr, limit et offset

  if(!req.query) {
    return next({status: 400, message: 'invalid input'})
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input query'})
  }
  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input param'})
  }

  let q = `SELECT comment_id, contenu, created, edited, author_id, name_user FROM commentaire, user_profile, reply_to 
  WHERE author_id=id_user AND comment_id = id_reply AND id_comment = $1 
  ORDER BY score(comment_like_count(comment_id)+1,comment_dislike_count(comment_id)) LIMIT $2`

  let par = [req.params.id,req.query.nbr]

  if(typeof req.query.offset === 'string'){
    q += 'OFFSET $3'
    par.push(req.query.offset)
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



//Top
app.get('/top',topReqComm)

function topReqComm(req, res, next) {

  if(!req.query) {
    return next({status: 400, message: 'invalid input'})
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input'})
  }

  let q = 'SELECT comment_id, contenu, created, edited, carte_id, author_id, name_user FROM commentaire, user_profile WHERE author_id=id_user ORDER BY score(carte_like_count(var_id)+1,carte_dislike_count(var_id)) LIMIT $1'
  let par = [req.query.nbr]

  if(typeof req.query.offset === 'string'){
    q += 'OFFSET $2'
    par.push(req.query.offset)
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


//POST
//comment
app.post('/', postComm)
app.post('/reply', postReply )

function postComm(req, res, next){ // Req avec comme body contenu, carte_id, et author_id dans cookies

  if(!req.signedIn){
    return next({status: 403, message: 'Pas Authorisé'})
  }

  let q = `INSERT INTO commentaire (contenu, created, carte_id, author_id) VALUES($1, now(), $2, $3)`

  let par = [req.body.contenu, req.body.carte_id, req.signedCookies.user_id]

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
      client.query( q, par, function(err,result) {  

        if (shouldAbort(err)){
          return next({status: 500, message: 'Problem of insert'})
        }

        if(result == undefined || result.rows == undefined){
          return next({status: 400, message: 'invalid input'})
        }
        res.status(201)
        res.send()

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

function postReply(req, res, next){ // Req avec comme body contenu, carte_id, et author_id dans cookies

  if(!req.signedIn){
    return next({status: 403, message: 'Pas Authorisé'})
  }

  let q = `INSERT INTO commentaire (contenu, created, carte_id, author_id) VALUES($1, now(), $2, $3)`

  let par = [req.body.contenu, req.body.carte_id, req.signedCookies.user_id]

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
      client.query( q, par, function(err,result) {  

        if (shouldAbort(err)){
          return next({status: 500, message: 'Problem of insert'})
        }

        if(result == undefined || result.rows == undefined){
          return next({status: 400, message: 'invalid input'})
        }
        res.status(201)
        res.send()

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

//PUT
app.put('/like/:id', likeComm)
app.put('/dislike/:id', dislikeComm )


function likeComm(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas logged in'})
  }
  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input param'})
  }

  let q = `INSERT INTO comment_like VALUES($1, $2, $3)`

  let par = [req.params.id, req.signedCookies.user_name, true]

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
      
      client.query( q, par, function(err,result) {  

        if(shouldAbort(err)){
          return next({status: 500, message: 'Problem of insert'})
        }

        if(result == undefined || result.rows == undefined){
          return next({status: 400, message: 'invalid input'})
        }
        res.status(201)
        res.send()

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

function dislikeComm(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas logged in'})
  }
  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input param'})
  }

  let q = `INSERT INTO comment_like VALUES($1, $2, $3)`

  let par = [req.params.id, req.signedCookies.user_name, false]

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
      
      client.query( q, par, function(err,result) {  

        if(shouldAbort(err)){
          return next({status: 500, message: 'Problem of insert'})
        }

        if(result == undefined || result.rows == undefined){
          return next({status: 400, message: 'invalid input'})
        }
        res.status(201)
        res.send()

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

//DELETE
//comment
app.delete('/', )



module.exports = app