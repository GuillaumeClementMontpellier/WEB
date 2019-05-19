"use strict";

const express = require('express')
const router = express.Router()


/* GET user pages */

router.get('/commentaires/:id', comm) 
router.get('/commentaires', comm) 

function comm(req, res, next) {

	if(!req.signedIn){
		return res.redirect('/')
	}
	if(typeof req.params.id !== 'string'){
		req.params.id = req.signedCookies.user_id
	}

  res.render('users/comment', {vue : '<script src="/ressource/js/user_comment_vue.js"></script>', id: req.params.id});
  
}

router.get('/likes/:id', lik);
router.get('/likes', lik);

function lik(req, res, next) {

	if(!req.signedIn){
		return res.redirect('/')
	}
	if(typeof req.params.id !== 'string'){
		req.params.id = req.signedCookies.user_id
	}

  res.render('users/likes', {vue : '<script src="/ressource/js/user_likes_vue.js"></script>', id: req.params.id});
  
}

router.get('/:id', function(req, res, next) {

  res.send('respond with a resource');
  
});

router.get('/', function(req, res, next) {

  res.send('respond with a resource');
  
});

module.exports = router;
