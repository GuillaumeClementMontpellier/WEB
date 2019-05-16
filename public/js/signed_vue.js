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

	<a :href="'/carte/' + carte.var_id"> 
	<img :src="carte.image_url" alt="Carte" class="w3-image w3-btn">
	</a>

	<div class="w3-row">

	<div class="w3-col s4">

	<button @click="like()" class="w3-button w3-btn"> Like </button>

	</div>

	<div class="w3-col s4">

	<button @click="dislike()" class="w3-button w3-btn"> Disike </button>

	</div>

	<div class="w3-col s4">

	<a :href="'/carte/' + carte.var_id">
	<button class="w3-button w3-btn"> Voir les commentaires </button> 
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

Vue.component('comment-preview',{
	props: {
		comm:{
			required: true,
			type: Object
		}
	},
	template:`
	<div class="w3-container">

	</div>
	`,
	methods: {
		like() {
			this.$emit('liked', this.comm)
		},
		dislike() {
			this.$emit('disliked', this.comm)
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
		liked_carte(carte, deja) {//prend une carte et si la personne a deja (dis)like cette carte, et patch / put le like en requete
			return 
		},
		disliked_carte(carte, deja) {
			return
		},		
		liked_comm(comm, deja) {//prend une carte et si la personne a deja (dis)like cette carte, et patch / put le like en requete
			return 
		},
		disliked_comm(comm, deja) {
			return
		}

	}

})