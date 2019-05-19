"use strict"


Vue.component('comment',{
	props: {
		comm:{
			required: true,
			type: Object
		}
	},
	template:`
	<div class="w3-container w3-card w3-margin-bottom w3-left-align">

	<p> <a :href="url_user"> {{comm.name_user}} </a> dit le {{comm.created}} <span v-if="comm.edited">(edité le : {{comm.edited}})</span> sur <a :href="carte">cette carte</a>: </p> 

	<div class="w3-card">

	<p> {{comm.contenu}} </p>

	</div>

	<div class="w3-row">

	<button class="w3-button w3-btn w3-border" @click="like()"> Like </button>

	<button class="w3-button w3-btn w3-border" @click="dislike()"> Dislike </button>

	</div>

	<div>

	</div>

	<button class="w3-button w3-btn w3-border" @click="fetchReply()"> Voir plus de reponses </button>

	<div class="reply_section w3-row">

	<div style="visibility: hidden" class="w3-col m1 l1">
	LEFT
	</div>

	<div class="w3-col s12 m11 l11">

	<comment v-for="repl in replys" :key="repl.comment_id" :comm="repl" @liked="liked_fils(repl)" @disliked="disliked_fils(repl)"> </comment>

	</div>
	
	</div>

	</div>
	`,
	data(){
		return {
			replys : []
		}
	},
	methods: {
		like() {
			this.$emit('liked', this.comm)
		},
		dislike() {
			this.$emit('disliked', this.comm)
		},
		liked_fils(repl) {
			this.$emit('liked', repl)
		},
		disliked_fils(repl) {
			this.$emit('disliked', repl)
		},
		fetchReply(){			

			fetch( "/api/comment/reply/" + this.comm.comment_id +"?nbr=6&offset=" + this.replys.length, { credentials: 'same-origin'})
			.then( (res) => {
				return res.json()
			} )
			.then( (res) => {
				let c
				for (c in res){
					res[c].created = (new Date(res[c].created)).toLocaleDateString()
					if (res[c].edited){
						res[c].edited = (new Date(res[c].edited)).toLocaleDateString()
					}
				}
				this.replys = this.replys.concat(res)
			} )
			.catch( function(error) {
				console.log('There has been a problem with reply fetch operation: ', error.message)
			})

		}
	},
	computed : {
		url_user (){
			return '/user/' + this.comm.author_id
		},
		carte (){
			return '/carte/' + this.comm.carte_id
		}
	}
})



let app = new Vue({

	el: '#app',
	data: {
		comments_preview : [],
		carte: {
			id: -1,
			name: "",
			imgURL:"",
			scryURL:"",
			gathURL:"",
			mana_cost: -1,
			cmc: "",
			oracle:"",
			flavor:"",
			types:"",
			stypes:"",
			edition_name: ""
		},
		contenuComm: ""
	},

	created: function(){

		this.carte.id = document.getElementById("id_carte").innerHTML
		
		fetch("/api/carte/comments/"+this.carte.id+"?nbr=6", { credentials: 'same-origin'})
		.then( (res) => {
			return res.json()
		} )
		.then( (res) => {
			this.comments_preview = res
			let c
			for (c in this.comments_preview){
				this.comments_preview[c].created = (new Date(this.comments_preview[c].created)).toLocaleDateString()
				if (this.comments_preview[c].edited){
					this.comments_preview[c].edited = (new Date(this.comments_preview[c].edited)).toLocaleDateString()
				}
			}
		} )
		.catch( function(error) {
			console.log('There has been a problem with initial fetch operation: ', error.message)
		})

		fetch("/api/carte/"+this.carte.id, { credentials: 'same-origin'})
		.then((res) => {
			return res.json()
		})
		.then( (res) => {
			this.carte.name = res.carte_name
			this.carte.imgURL = res.image_url
			this.carte.scryURL = res.scry_url
			this.carte.gathURL = res.gath_url
			this.carte.mana_cost = res.mana_cost
			this.carte.cmc = res.cmc
			this.carte.oracle = res.oracle
			this.carte.flavor = res.flavor
			this.carte.edition_name = res.edition_name
		} )
		.catch( function(error) {
			console.log('There has been a problem with initial fetch operation: ', error.message)
		})

	}, 
	methods : {
		like() {//prend une carte et si la personne a deja (dis)like cette carte, et patch / put le like en requete TODO
			fetch("/api/carte/like/"+this.carte.id, { credentials: 'same-origin', method : 'PUT'})
			.then((res)=>{
				console.log(res)
			})
		},
		dislike() {
			fetch("/api/carte/dislike/"+this.carte.id, { credentials: 'same-origin', method : 'PUT'})
			.then((res)=>{
				console.log(res)
			})
		},		
		liked_comm(comm) {//prend une carte et si la personne a deja (dis)like cette carte, et patch / put le like en requete
			fetch("/api/comment/like/"+comm.comment_id, { credentials: 'same-origin', method : 'PUT'})
			.then((res)=>{
				console.log(res)
			})
		},
		disliked_comm(comm) {
			fetch("/api/comment/dislike/"+comm.comment_id, { credentials: 'same-origin', method : 'PUT'})
			.then((res)=>{
				console.log(res)
			})
		},	
		fetch_comm(){

			fetch( "/api/carte/comments/"+this.carte.id+"?nbr=6&offset=" + this.comments_preview.length, { credentials: 'same-origin'})
			.then( (res) => {
				return res.json()
			} )
			.then( (res) => {
				
				let c
				for (c in res){
					res[c].created = (new Date(res[c].created)).toLocaleDateString()
					if (res[c].edited){
						res[c].edited = (new Date(res[c].edited)).toLocaleDateString()
					}
				}
				this.comments_preview = this.comments_preview.concat(res)

			} )
			.catch( function(error) {
				console.log('There has been a problem with reply fetch operation: ', error.message)
			})

		},
		submitComm(){

			let data = {
				contenu: this.contenuComm,
				carte_id: this.carte.id
			}

			fetch('/api/comment/', { 
				credentials: 'same-origin', 
				method : 'POST',
				body: JSON.stringify(data)
			})
			.then( (res) =>{

				this.contenuComm = '';

			})
			.catch( function(error) {
				console.log('There has been a problem with reply fetch operation: ', error.message)
			})


		}

	}

})