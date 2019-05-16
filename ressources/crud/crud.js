"use strict"

const express = require('express')
const router = express.Router()

const apiCarte = require('./carteAPI.js')
const apiUsers = require('./usersAPI.js')
const apiComment = require('./commentAPI.js')

//construit la requete

router.use('/carte', apiCarte);
router.use('/users', apiUsers);
router.use('/comment', apiComment);


//error handler
router.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {message: "Error", status: err.status} );

})


module.exports = router

//acces type a la base de donnee 
//PAS FAIRE CONSOLE.log, c'est synchrone !!

//cela marche seulement sur le heroku, pas en local (pas ssl en local) ?
//connection a la BD TODO adapter
/*
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

pool.on('error', function (err, client){

  console.error('Unexpected error on idle client', err)

})

router.get('/', function (req, res, next) {

  pool.connect( function(err,client,done) {

    if(err){
      console.log("not able to get connection "+ err);
      res.status(400).send(err);
    } 

    client.query('SELECT * FROM edition where code = $1', ["WAR"], function(err,result) {

      done(); // closing the connection

      if(err) {
       console.log(err);
       res.status(400).send(err);
      }
      res.status(200).send(result.rows);
    });
  });
});

*/
