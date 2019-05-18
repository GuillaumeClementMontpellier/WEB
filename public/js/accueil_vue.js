"use strict"

Vue.component('carte-preview',{
	props: {
		carte:{
			required: true,
			type: Object
		}
	},
	template:`
	<div class="w3-card w3-margin-bottom">

	<a href="/login/login"> 
	<img :src="carte.image_url" alt="Carte" class="w3-image w3-margin-bottom">
	</a>

	<div class="w3-row w3-margin-bottom">

	<div class="w3-col s1" style="visibility: hidden">LEFT</div>

	<div class="w3-col s4">

	<a href="/login/login"><button class="w3-button w3-border w3-btn w3-block"> Like </button></a>

	</div>

	<div class="w3-col s2" style="visibility: hidden">MIDDLE</div>

	<div class="w3-col s4">

	<a href="/login/login"><button class="w3-button w3-border w3-btn w3-block"> Disike </button></a>

	</div>

	<div class="w3-col s1" style="visibility: hidden">RIGHT</div>

	</div>

	<div class="w3-row w3-margin-bottom">

	<div class="w3-col s1" style="visibility: hidden">LEFT</div>

	<div class="w3-col s10">

	<a href="/login/login">
	<button class="w3-button w3-border w3-btn w3-block"> Commentaires </button> 
	</a>

	</div>

	<div class="w3-col s1" style="visibility: hidden">RIGHT</div>

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