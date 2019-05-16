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

	<a href="/login/login"> 
	<img :src="carte.image_url" alt="Carte" class="w3-image w3-btn">
	</a>

	<div class="w3-row">

	<div class="w3-col s6">

	<a href="/login/login"><button class="w3-button w3-border w3-btn"> Like </button></a>

	</div>

	<div class="w3-col s6">

	<a href="/login/login"><button class="w3-button w3-border w3-btn"> Disike </button></a>

	</div>

	<div class="w3-col s12">

	<a href="/login/login">
	<button class="w3-button w3-border w3-btn w3-block"> Voir les commentaires </button> 
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
		cartes_preview : []
	},

	created: function(){

		fetch("/api/carte/bytop?nbr=12", { credentials: 'same-origin'})
		.then( (res) => {
			return res.json()
		} )
		.then( (res) => {
			this.cartes_preview=res
		} )
		.catch(function(error) {
			console.log('There has been a problem with initial fetch operation: ', error.message)
		})

	}

})