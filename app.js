var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//ou sont situe les modules des ressources
var indexRouter = require('./ressources/accueil/index');
var usersRouter = require('./ressources/users/users');

var app = express();

//connection a la BD TODO deplacer dans CRUD
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});


// view engine setup (a changer ?)
app.set('views', path.join(__dirname, 'ressources'));
app.set('view engine', 'ejs');

//mets le morgan logger
app.use(logger('dev'));

//middleware that parse Unicode into JSON if body content type is application/json
app.use(express.json());
//middleware that parse request 
app.use(express.urlencoded({ extended: false }));
//parse les cookies
app.use(cookieParser());

//permet de livrer les fichiers dans public (pour Vue, W3-CSS, et images)
app.use(express.static(path.join(__dirname, 'public')));

//routing pour les ressources
app.use('/', indexRouter); 
app.use('/users', usersRouter);

//acces a la base de donnee TODO deplacer dans CRUD
app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })


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
