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

	<a :href="'/carte/' + carte.var_id"> 
	<img :src="carte.image_url" alt="Carte" class="w3-image  w3-margin-bottom">
	</a>

	<div class="w3-row  w3-margin-bottom">

	<div class="w3-col s1" style="visibility: hidden">LEFT</div>

	<div class="w3-col s4">

	<button @click="like()" class="w3-button w3-btn w3-border"> Like </button>

	</div>

	<div class="w3-col s2" style="visibility: hidden">MIDDLE</div>

	<div class="w3-col s4">

	<button @click="dislike()" class="w3-button w3-btn w3-border"> Disike </button>

	</div>

	<div class="w3-col s1" style="visibility: hidden">RIGHT</div>

	</div>

	<div class="w3-row  w3-margin-bottom">

	<div class="w3-col s1" style="visibility: hidden">LEFT</div>

	<div class="w3-col s10">

	<a :href="'/carte/' + carte.var_id">
	<button class="w3-button w3-border w3-btn w3-block"> Voir les commentaires </button> 
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
		cartes_preview : [],
		id : -1,
		name: ''
	},

	created: function(){

		this.id = document.getElementById("id_user").innerHTML

		fetch("/api/users/likes/"+this.id+"?nbr=6", { credentials: 'same-origin'}) //fetch les comm de user
		.then( (res) => {
			return res.json()
		} )
		.then( (res) => {
			this.cartes_preview = res
		} )
		.catch( function(error) {
			console.log('There has been a problem with initial fetch operation: ', error.message)
		})

		fetch("/api/users/id/"+this.id, { credentials: 'same-origin'})
		.then((res) => {
			return res.json()
		})
		.then( (res) => {
			this.name = res.name_user
		} )
		.catch( function(error) {
			console.log('There has been a problem with initial fetch operation: ', error.message)
		})

	}, 
	methods : {
		liked_carte(carte) {//prend une carte et si la personne a deja (dis)like cette carte, et patch / put le like en requete TODO
			fetch("/api/carte/like/"+carte.var_id, { credentials: 'same-origin', method : 'PUT'})
			.then((res)=>{
				console.log(res)
			})
		},
		disliked_carte(carte) {
			fetch("/api/carte/dislike/"+carte.var_id, { credentials: 'same-origin', method : 'PUT'})
			.then((res)=>{
				console.log(res)
			})
		},		
		fetch_cartes(){

			fetch( "/api/users/likes/"+this.id+"?nbr=6&offset=" + this.cartes_preview.length, { credentials: 'same-origin'})
			.then( (res) => {
				return res.json()
			} )
			.then( (res) => {
				this.cartes_preview = this.cartes_preview.concat(res)
			} )
			.catch( function(error) {
				console.log('There has been a problem with reply fetch operation: ', error.message)
			})

		},

		supprimerCompte(){

			fetch("/api/users/", { credentials: 'same-origin', method : 'DELETE'})
			.then((res)=>{
				console.log(res)
			})

		}

	}

})