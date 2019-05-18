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

  console.log(err.message)

  // render the error page
  res.status(err.status || 500);
  res.render('error', {message: "Error", status: err.status} );

})


module.exports = router
