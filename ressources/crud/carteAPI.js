"use strict";

const express = require('express')
const app = express.Router()

const { Pool } = require('pg');

//connection a la BD
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

//GET
app.get('/top', topReq)
app.get('/nbr_comment', nbrReq)
app.get('/comments', commentsReq)
app.get('/types',typesReq)
app.get('/sub_types',sTypesReq)
app.get('/editions',editionReq)
app.get('/modele',modeleReq)
app.get('/:id_carte',carteInfoReq)

//req un certains nombre de cartes, qui ont meuileur score de wilson
function topReq(req, res, next) {

    if(!req.params) next(new Error(400))
    if(!req.params.nbr) next(new Error(400))

	pool.query('SELECT id, image_url FROM carte_var ', [], function(err,result) {

    done(); // closing the connection

    if(err) {
    	console.log(err);
    	res.status(400).send(err);
    }
    res.status(200).send(result.rows);

  });
}



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


module.exports = app