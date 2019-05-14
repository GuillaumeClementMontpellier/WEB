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
//app.get('/bynbrcomment', nbrReq)

//req un certains nombre de cartes, qui ont meilleur score de wilson (params : nbr[, offset[, desc]])
function topReq(req, res, next) {

  if(!req.query) next(new Error(400));
  if(typeof req.query.nbr !== 'string') {
    console.log(typeof req.params.nbr)
    return next({status: 400, message: 'invalid input'});
  }

  let q = 'SELECT "id", image_url FROM carte_var WHERE carte_like_count(id) + carte_dislike_count(id) > 0 ORDER BY score(carte_like_count(id),carte_dislike_count(id)) LIMIT $1';
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
    console.log('result : '+typeof result + 'result.rows' + typeof result.rows)
    res.status(200);
    res.send(result.rows);
  });
}
/*
//req un certains nombre nbr de cartes, qui ont le plus de comments, avec potentiellement un offset et un ordre different
function nbrReq(req, res, next) {

  if(!req.query) next(new Error(400));
  if(typeof req.query.nbr !== 'string') {
    console.log(typeof req.params.nbr)
    next(new Error(400));
  }

  let q = 'SELECT carte_var."id", image_url, count(*) as nbr FROM carte_var, "comment" WHERE "comment".carte_id = carte_var.id GROUP BY carte_var."id", image_url ORDER BY nbr LIMIT $1'
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
      next(new Error(404))
    }  
    res.status(200);
    res.send(result.rows);
  });

}

//tout les types/soustypes/modeles/editions de cartes -------------
app.get('/types',typesReq)
app.get('/sub_types',sTypesReq)
app.get('/editions',editionReq)
app.get('/modele',modeleReq)




//infos sur une certaine carte (de la carte, ou ses comments) -----------------
app.get('/:id_carte',carteInfoReq)
app.get('/comments/:id_carte', commentsReq)






//PUT a besoin de transaction
app.put('/like/:id',)
app.put('/dislike/:id',)
//PUT admin only
app.put('/var',)
app.put('/modele',)

//PATCH pour changer like en dislike et vice versa
app.patch('/like/:id',)
app.patch('/dislike/:id',)

//DELETE a besoin de transaction
app.delete('/like/:id',)
//DELETE admin only
app.delete('/var/:id',)
app.delete('/modele/:id',)
*/

module.exports = app