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

pool.on('error', traitementErreur)

function traitementErreur(err, client){

  console.error('Unexpected error on idle client', err)

}

//acces a la base de donnee 
router.get('/',queryDb)


function queryDb(req, res, next) {

  pool.connect( (err, client, done) => {
    if (err) throw err

    client.query('SELECT * FROM edition WHERE id = $1', [1], (err, res) => {

      done()

      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows)
        res.send(res.rows)
      }
    })

  })
  
}


module.exports = router