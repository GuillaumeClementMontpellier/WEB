"use strict";

const express = require('express')
const router = express.Router()

//connection a la BD TODO adapter
const { Pool } = require('pg');

//pour hasher password
const sjcl = require('sjcl');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

pool.on('error', function (err, client){

  console.error('Unexpected error on idle client', err)

})

//acces a la base de donnee 

//cela marche seulement sur le heroku, pas en local (pas ssl en local) ?
/*
router.get('/', function (req, res, next) {
  pool.connect( function(err,client,done) {
   if(err){
     console.log("not able to get connection "+ err);
     res.status(400).send(err);
   } 
   client.query('SELECT * FROM edition where code = $1', ["WAR"],function(err,result) {
           done(); // closing the connection;
           if(err){
             console.log(err);
             res.status(400).send(err);
           }
           res.status(200).send(result.rows);
         });
 });
});
*/
router.get('/', apiGet);
function apiGet(req, res, next) {

  pool.connect(reqGet);

}

function reqGet(err,client,done) {
 if(err){
   console.log("not able to get connection "+ err);
   res.status(400).send(err);
 } 
 client.query('SELECT * FROM edition where code = $1', ["WAR"],resGet);
}

function resGet(err,result) {
  done(); // closing the connection;
  if(err){
   console.log(err);
   res.status(400).send(err);
 }
 res.status(200).send(result.rows);
}


module.exports = router