"use strict";

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//where are ressources
const accueilRouter = require('./ressources/accueil/accueil');
const usersRouter = require('./ressources/users/users');
const apiRouter = require('./ressources/crud/crud')

const app = express();

// view engine setup (a changer ?)
app.set('views', path.join(__dirname, 'ressources'));
app.set('view engine', 'ejs');

//mets le morgan logger, ne log pas ce qui est monté avant
app.use(logger('dev'));

//middleware that parse Unicode into JSON if body content type is application/json
app.use(express.json());
//middleware that parse request 
app.use(express.urlencoded({ extended: false }));
//parse les cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

//permet de livrer les fichiers ressource dans public (pour Vue, W3-CSS, et images) : URI doit etre /ressource/chemin du fichier a partir de public
app.use('/ressource',express.static(path.join(__dirname, 'public')));

//routing pour les ressources -------------------------
app.use('/api', apiRouter);
app.use('/', accueilRouter); 
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
