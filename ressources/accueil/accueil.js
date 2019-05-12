const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('accueil/index',{ vue: '<script src="js/accueil_vue.js"></script>'});
  
});

module.exports = router;
