"use strict"

Vue.component('carte-preview',{
	props: {
		carte:{
			required: true,
			type: Object
		}
	},
	template:`
	<div class="w3-container">

	<a href="/login"> 
	<img :src="carte.image_url" alt="Carte" class="w3-image">
	</a>

	<div class="w3-row">

	<div class="w3-col s4">

	<button @click="like()" class="w3-button"> Like </button>

	</div>

	<div class="w3-col s4">

	<button @click="dislike()" class="w3-button"> Disike </button>

	</div>

	<div class="w3-col s4">

	<a :href="'/carte/' + carte.var_id">
	<button class="w3-button"> Voir les commentaires </button> 
	</a>

	</div>

	</div>

	</div>
	`,
	methods: {
		like() {
			this.$emit('liked', this.carte)
		},
		dislike() {
			this.$emit('disliked', this.carte)
		},
	},

})

let app = new Vue({

	el: '#app',
	data: {
		cartes_preview : [],
		comments_preview : [],
		replys_preview : []
	},

	created: function(){

		fetch("/api/carte/bytop?nbr=6", { credentials: 'same-origin'})
		.then( (res) => {
			console.log(res)
			return res.json()
		} )
		.then( (res) => {
			console.log(res)
			this.cartes_preview = res
		} )
		.catch(function(error) {
			console.log('There has been a problem with initial fetch operation: ', error.message)
		})
		/*
		fetch("/api/comment?nbr=6", { credentials: 'same-origin'})
		.then( (res) => {
			return res.json()
		} )
		.then( (res) => {
			this.cartes_preview = res
		} )
		.catch(function(error) {
			console.log('There has been a problem with initial fetch operation: ', error.message)
		})*/

	}, 
	methods : {
		liked(carte, deja) {//prend une carte et si la personne a deja (dis)like cette carte, et patch / put le like en requete
			return 
		},
		disliked(carte, deja) {
			return
		}

	}

})