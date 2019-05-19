"use strict"

const express = require('express')
const router = express.Router()


/* GET cartes */
router.get('/',showAll)
router.get('/all',showAll)

function showAll(req, res, next){

	if(!req.signedIn){
		return res.redirect('/')
	}

  res.render('carte/all_cartes', {vue : '<script src="/ressource/js/carte_all_vue.js"></script>'})

}

//get template pour creer cartes (si admin)
router.get('/template_type',createCarte)
router.get('/template_var',createVar)

function createCarte(req, res, next){

	if(!req.signedInAdmin){
		return res.redirect('/')
	}

  res.render('carte/template_type', {vue : '<script src="/ressource/js/carte_template_vue.js"></script>'})

}
function createVar(req, res, next){

	if(!req.signedInAdmin){
		return res.redirect('/')
	}

  res.render('carte/template_var', {vue : '<script src="/ressource/js/var_template_vue.js"></script>'})

}


//montre la carte et ses commentaires
router.get('/:id', showCarte)

function showCarte(req, res, next){

	if(!req.signedIn || typeof req.params.id !== 'string' || isNaN(req.params.id)){
		return res.redirect('/carte')
	}

  res.render('carte/show_carte', {vue : '<script src="/ressource/js/show_carte_vue.js"></script>', id : req.params.id})


}

module.exports = router
