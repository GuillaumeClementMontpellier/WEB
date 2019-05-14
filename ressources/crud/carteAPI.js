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
app.get('/by_top', topReq)
app.get('/by_nbr_comment', nbrReq)

//req un certains nombre de cartes, qui ont meilleur score de wilson (params : nbr[, offset, ])
function topReq(req, res, next) {

  if(!req.params) next(new Error(400));
  if(typeof req.params.nbr != 'number') next(new Error(400));

  let q = 'SELECT id, image_url FROM carte_var WHERE carte_like_count(id) + carte_dislike_count(id) > 0 ORDER BY score(carte_like_count(id),carte_dislike_count(id)) LIMIT $1;';
  let par = [req.params.nbr];

  if(typeof req.params.offset == 'number'){
    q += 'OFFSET $2'
    par.push(req.params.offset)
  }

  if(req.params.desc){
    q.replace('LIMIT', 'DESC LIMIT')
  }

  pool.query(q, par, function(err,result) {    
    if(err) {
      throw err
    }
    res.status(200);
    res.send(result.rows);
  });
}

//req un certains nombre de cartes, qui ont le plus de comments
function nbrReq(req, res, next) {

  if(!req.params) next(new Error(400));
  if(typeof req.params.nbr != 'number') next(new Error(400));

  let q = 'SELECT id, image_url, count(*) as nbr FROM carte_var, comment WHERE comment.carte_id = carte_var.id ORDER BY nbr LIMIT $1;';
  let par = [req.params.nbr];

  if(typeof req.params.offset == 'number'){
    q += 'OFFSET $2'
    par.push(req.params.offset)
  }

  if(req.params.desc){
    q.replace('LIMIT', 'DESC LIMIT')
  }

  pool.query(q, par, function(err,result) {

    if(err) {
      res.status(400).send(err);
    }
    res.status(200).send(result.rows);
  });
}/*

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

//DELETE a besoin de transaction
app.delete('/like/:id',)
//DELETE admin only
app.delete('/var/:id',)
app.delete('/modele/:id',)
*/

module.exports = app