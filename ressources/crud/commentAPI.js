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

//GET
//Specifique
// /:id mis a la fin pour detailsComm
app.get('/reply/:id',listeReply)

function detailsComm(req, res, next) {

  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input'})
  }

  let q = `SELECT comment_id, contenu, created, edited, carte_id, author_id, name_user FROM commentaire, user_profile WHERE comment_id = $1 AND author_id=id_user`

  let par = [escapeHtml(req.params.id)]

  pool.query(q, par, function(err,result) {    
    if(err || result == undefined || result.rows == undefined){
      return next({status: 400, message: 'invalid input'})
    }
    res.status(200)
    res.json(result.rows)
  })
}

function listeReply(req, res, next) { //  avec nbr et offset et desc

  if(!req.query) {
    return next({status: 400, message: 'invalid input'})
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input query'})
  }
  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input param'})
  }

  let q = `SELECT comment_id, contenu, created, edited, author_id, carte_id, name_user FROM commentaire, user_profile, reply_to 
  WHERE author_id=id_user AND comment_id = id_reply AND id_comment = $1 
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



//Top
app.get('/top',topReqComm)
app.get('/perstop',topReqCommPers)

function topReqComm(req, res, next) {

  if(!req.query) {
    return next({status: 400, message: 'invalid input'})
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input'})
  }

  let q = `SELECT comment_id, contenu, created, edited, carte_id, author_id, name_user FROM commentaire, user_profile 
  WHERE author_id=id_user ORDER BY score(comment_like_count(comment_id)+1,comment_dislike_count(comment_id)) LIMIT $1`

  let par = [escapeHtml(req.query.nbr)]

  if(typeof req.query.offset === 'string'){
    q += 'OFFSET $2'
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

function topReqCommPers(req, res, next) {

  if(!req.query) {
    return next({status: 400, message: 'invalid input'})
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input'})
  }
  if(!req.signedIn){
    return next({status: 401, message: 'Uknown User'})
  }

  let q = `SELECT comment_id, contenu, created, edited, carte_id, author_id, name_user FROM commentaire, user_profile 
  WHERE author_id=id_user AND id_user=$1 ORDER BY score(comment_like_count(comment_id)+1,comment_dislike_count(comment_id)) LIMIT $2`

  let par = [escapeHtml(req.signedCookies.user_id),escapeHtml(req.query.nbr)]

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



//POST
//comment
app.post('/', postComm)
app.post('/reply', postReply )

function postComm(req, res, next){ // Req avec comme body contenu, carte_id, et author_id dans cookies

  console.log(req.body)

  if(!req.signedIn){
    return next({status: 403, message: 'Pas Authorisé'})
  }
  if(!req.body.contenu || !req.body.carte_id){
    return next({status: 400, message: 'Bad Request'})
  }

  let q = `INSERT INTO commentaire (contenu, created, carte_id, author_id) VALUES($1, now(), $2, $3)`

  let par = [escapeHtml(req.body.contenu), escapeHtml(req.body.carte_id), escapeHtml(req.signedCookies.user_id)]

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
          done()
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

function postReply(req, res, next){ // Req avec comme body contenu, carte_id, et author_id dans cookies, et pere : id du comment pere

  if(!req.signedIn){
    return next({status: 403, message: 'Pas Authorisé'})
  }
  if(!req.body.contenu || !req.body.carte_id || !req.body.pere){
    return next({status: 400, message: 'Bad Request'})
  }

  let q = `INSERT INTO commentaire (contenu, created, carte_id, author_id) VALUES($1, now(), $2, $3) RETURNING comment_id`

  let par = [escapeHtml(req.body.contenu), escapeHtml(req.body.carte_id), escapeHtml(req.signedCookies.user_id)]

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
          done()
          return next({status: 400, message: 'invalid input'})
        }

        let q1 = `INSERT INTO reply_to VALUES($2,$1)`

        let par1 = [escapeHtml(result.rows[0].comment_id), escapeHtml(req.body.pere)]

        client.query( q1, par1, function(err,result) {  

          if (shouldAbort(err)){
            return next({status: 500, message: 'Problem of insert'})
          }

          if(result == undefined || result.rows == undefined){
            done()
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
  })
}

//PATCH COMMENT : change contenu => contenu est donné dans body
app.patch('/:id',patchComm)

function patchComm(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas logged in'})
  }
  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input param'})
  }

  let q = `UPDATE commentaire SET edited = now(), contenu = $2 WHERE comment_id = $1 AND author_id = $3`

  let par = [escapeHtml(req.params.id), escapeHtml(req.body.contenu), escapeHtml(req.signedCookies.user_id)]

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
          return next({status: 500, message: 'Problem of update'})
        }

        if(result == undefined || result.rows == undefined){
          done()
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

  let par = [escapeHtml(req.params.id), escapeHtml(req.signedCookies.user_id), true]

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
          done()
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

  let par = [escapeHtml(req.params.id), escapeHtml(req.signedCookies.user_id), false]

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
          done()
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
app.delete('/:id', deleteComm)


function deleteComm(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas logged in'})
  }
  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input param'})
  }

  let q = `UPDATE commentaire SET author_id = 0 AND contenu = "DELETED" AND edited = now() WHERE author_id = $1 AND comment_id = $2`

  let par = [escapeHtml(req.signedCookies.user_id), escapeHtml(req.params.id)]

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
          done()
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

//mis a la fin pour /:id qui reconnais tout
app.get('/:id',detailsComm)


module.exports = app