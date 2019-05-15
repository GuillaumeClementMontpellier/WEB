"use strict";

const express = require('express')
const app = express.Router()

const { Pool } = require('pg');

//connection a la BD
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

//GET -------------------------
//toutes les cartes ----------
app.get('/bytop', topReq)
app.get('/bynbrcomment', nbrReq)
app.get('/modeles',modeleReq)

//req un certains nombre de cartes, qui ont meilleur score de wilson (params : nbr[, offset[, desc]])
function topReq(req, res, next) {
  if(!req.query) {
    return next({status: 400, message: 'invalid input 1'});
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input 2'});
  }

  let q = 'SELECT var_id, image_url FROM carte_var WHERE carte_like_count(var_id) + carte_dislike_count(var_id) > 0 ORDER BY score(carte_like_count(var_id),carte_dislike_count(var_id)) LIMIT $1';
  let par = [req.query.nbr];

  if(typeof req.query.offset === 'string'){
    q += 'OFFSET $2'
    par.push(req.query.offset)
  }

  if(req.query.desc){
    q.replace('LIMIT', 'DESC LIMIT')
  }

  pool.query(q, par, function(err,result) {    
    if(err || result == undefined || result.rows == undefined){
      return next({status: 400, message: 'invalid input 3'})
    }
    res.status(200);
    res.json(result.rows);
  });
}


//req un certains nombre nbr de cartes, qui ont le plus de comments, avec potentiellement un offset et un ordre different
function nbrReq(req, res, next) {
  if(!req.query) {
    return next({status: 400, message: 'invalid input'});
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input'});
  }

  let q = 'SELECT carte_var.var_id, image_url, count(*) as nbr FROM carte_var, commentaire WHERE commentaire.carte_id = carte_var.var_id GROUP BY carte_var.var_id, image_url ORDER BY nbr LIMIT $1';
  let par = [req.query.nbr];

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
    res.status(200);
    res.json(result.rows);
  });
}

//Tout les modeles de carte, selon query
function modeleReq(req, res, next) {

  if(!req.query) {
    return next({status: 400, message: 'invalid input'});
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input'});
  }

  let q = 'SELECT carte_id, carte_name FROM carte_type ORDER BY carte_id LIMIT $1';
  let par = [req.query.nbr];

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
    res.status(200);
    res.json(result.rows);
  });
}


//tout les types/soustypes/modeles/editions de cartes -------------
app.get('/types',typesReq)
app.get('/sub_types',sTypesReq)
app.get('/editions',editionReq)

//tout les types de carte (creature, enchant, ephemere, rituel, ...) SANS LIMITES
function typesReq(req, res, next) {

  let q = 'SELECT name_type FROM type_c';

  pool.query(q, [], function(err,result) {    
    if(err || result == undefined || result.rows == undefined){
      return next({status: 400, message: 'invalid input'})
    }
    res.status(200);
    res.json(result.rows);
  });
}

//tout les sub types de carte (loups, humain, guerrier, soldat, elfe, dinosaure, shaman, arcane, cartouche, dieu, ...) AVEC LIMITES ET OFFSET ET ORDRE
function sTypesReq(req, res, next) {
  if(!req.query) {
    return next({status: 400, message: 'invalid input'});
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input'});
  }

  let q = 'SELECT name_type FROM sub_type_c ORDER BY name_type LIMIT $1';
  let par = [req.query.nbr];

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
    res.status(200);
    res.json(result.rows);
  });
}
//toutes les editions de carte (WAR, M19, DAM, RNA, GRN, IXL, RIX, ...) AVEC LIMITES ET OFFSET ET ORDRE
function editionReq(req, res, next) {
  if(!req.query) {
    return next({status: 400, message: 'invalid input'});
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input'});
  }

  let q = 'SELECT code, edition_name FROM edition ORDER BY code LIMIT $1';
  let par = [req.query.nbr];

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
    res.status(200);
    res.json(result.rows);
  });
}

//infos sur une certaine carte (de la carte, ou ses comments) -----------------
app.get('/:id_carte',carteInfoReq)
app.get('/comments/:id_carte', commentsReq)
//cherche infos de base de la carte
function carteInfoReq(req, res, next) {

  if(typeof req.params.id_carte !== 'string') {
    return next({status: 400, message: 'invalid input'});
  }

  let q = `SELECT var_id, carte_name, mana_cost, cmc, image_url, oracle, flavor, scry_url, gath_url, edition_name 
  FROM carte_var, edition, carte_type WHERE edition_code=code AND carte_var.carte_id=carte_type.carte_id AND var_id=$1`;

  let par = [req.params.id_carte];

  pool.query(q, par, function(err,result) {    
    if(err || result == undefined || result.rows == undefined){
      return next({status: 400, message: 'invalid input'})
    }
    res.status(200);
    res.json(result.rows);
  });
}
//cherche les top level comments de la carte, AVEC LIMIT ET  OFFSET
function commentsReq(req, res, next) {

  if(!req.query) {
    return next({status: 400, message: 'invalid input'});
  }
  if(typeof req.query.nbr !== 'string') {
    return next({status: 400, message: 'invalid input query'});
  }
  if(typeof req.params.id_carte !== 'string') {
    return next({status: 400, message: 'invalid input param'});
  }

  let q = `SELECT comment_id, contenu, created, edited, author_id, name_user FROM commentaire, user_profile, reply_to 
  WHERE author_id=id_user AND comment_id NOT IN (select id_reply from reply_to) AND var_id=$1 
  ORDER BY score(comment_like_count(comment_id),comment_dislike_count(comment_id))LIMIT $2`;

  let par = [req.params.id_carte,req.query.nbr];

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
    res.status(200);
    res.json(result.rows);
  });
}


//PUT a besoin de transaction
app.put('/like/:id',likePut)
app.put('/dislike/:id',likePut)

function likePut(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas logged in'});
  }
  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input param'});
  }

  let q = `INSERT INTO carte_like VALUES($1, $2, $3)`;

  let par = [req.params.id, req.signedCookies.user_name, true];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
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
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

function dislikePut(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas logged in'});
  }
  if(typeof req.params.id !== 'string') {
    return next({status: 400, message: 'invalid input param'});
  }

  let q = `INSERT INTO carte_like VALUES($1, $2, $3)`;

  let par = [req.params.id, req.signedCookies.user_name, false];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
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
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

//PUT admin only
app.put('/var',putCarteVar)
app.put('/modele',putCarteType)

function putCarteVar(req, res, next){

  if(!req.signedInAdmin){
    return next({status: 403, message: 'Pas Authorisé'});
  }

  let q = `INSERT INTO carte_var (image_url, flavor, scry_url, gath_url, edition_code, carte_id) VALUES($1, $2, $3; $4, $5, $6)`;

  let par = [req.query.image_url, req.query.flavor, req.query.scry_url, req.query.gath_url, req.query.edition_code, req.query.carte_id];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
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
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

function putCarteType(req, res, next){

  if(!req.signedInAdmin){
    return next({status: 403, message: 'Pas Authorisé'});
  }

  let q = `INSERT INTO carte_type (carte_name, oracle, mana_cost, cmc) VALUES($1, $2, $3, $4)`;

  let par = [req.query.carte_name, req.query.oracle, req.query.mana_cost, req.query.cmc];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
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
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

//PATCH pour changer like en dislike et vice versa
app.patch('/like/:id',patchLike)
app.patch('/dislike/:id',patchDislike)

function patchLike(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas Authorisé'});
  }

  let q = `UPDATE carte_like set aime = true WHERE carte_id= $1 AND user_id = $2`;

  let par = [req.params.id, req.signedCookies.user_id];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
        })
      }
      return !!err
    }

    client.query('BEGIN', function(err){
      if (shouldAbort(err)){
        return next({status: 500, message: 'Problem of transaction'})
      }

      client.query( q, par, function(err,result) {  

        if (shouldAbort(err)){
          return next({status: 500, message: 'Problem of insert'})
        }

        if(result == undefined || result.rows == undefined){
          return next({status: 400, message: 'invalid input'})
        }
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}
function patchDislike(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas Authorisé'});
  }

  let q = `UPDATE carte_like set aime = false WHERE carte_id= $1 AND user_id = $2`;

  let par = [req.params.id, req.signedCookies.user_id];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
        })
      }
      return !!err
    }

    client.query('BEGIN', function(err){
      if(shouldAbort(err)) {
        return next({status: 500, message: 'Problem of transaction'})
      }

      client.query( q, par, function(err,result) {  

        if (shouldAbort(err)){
          return next({status: 500, message: 'Problem of insert'})
        }

        if(result == undefined || result.rows == undefined){
          return next({status: 400, message: 'invalid input'})
        }
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}

//DELETE a besoin de transaction
app.delete('/like/:id',deleteLike)
function deleteLike(req, res, next){

  if(!req.signedIn){
    return next({status: 403, message: 'Pas Authorisé'});
  }

  let q = `DELETE FROM carte_like WHERE carte_id= $1 AND user_id = $2`;

  let par = [req.params.id, req.signedCookies.user_id];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
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
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}
//DELETE admin only
app.delete('/var/:id',deleteVar)
app.delete('/modele/:id',deleteModele)

function deleteVar(req, res, next){

  if(!req.signedInAdmin){
    return next({status: 403, message: 'Pas Authorisé'});
  }

  let q = `DELETE FROM carte_var WHERE var_id = $1`;

  let par = [req.params.id];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
        })
      }
      return !!err
    }

    client.query('BEGIN', function(err){
      if (shouldAbort(err)){
        return next({status: 500, message: 'Problem of transaction'})
      }

      client.query( q, par, function(err,result) {  

        if(shouldAbort(err)){
          return next({status: 500, message: 'Problem of insert'})
        }

        if(result == undefined || result.rows == undefined){
          return next({status: 400, message: 'invalid input'})
        }
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}
function deleteModele(req, res, next){

  if(!req.signedInAdmin){
    return next({status: 403, message: 'Pas Authorisé'});
  }

  let q = `DELETE FROM carte_type WHERE carte_id = $1`;

  let par = [req.params.id];

  pool.connect(function (err, client, done){

    const shouldAbort = function(err){
      if (err) {
        client.query('ROLLBACK', function (err) {
          done();
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
        res.status(201);
        res.send();

        client.query('COMMIT', function(err){
          done()
        })
      })
    })
  })
}


module.exports = app