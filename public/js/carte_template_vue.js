

let app = new Vue({

	el: '#app',

	data: {
		editions: [],
		carte_t:[],
		nom_carte: '',
		nom_edition: '',
		code_edition: ''

	},
	created: function(){

		fetch("/api/carte/editions", { credentials: 'same-origin'}) //fetch les comm de user
		.then( (res) => {
			return res.json()
		} )
		.then( (res) => {
			this.editions = res
		} )
		.catch( function(error) {
			console.log('There has been a problem with initial fetch operation: ', error.message)
		})

	},
	methods: {
		rechercher_carte(){			

			fetch("/api/carte/modeles?nom="+this.nom_carte, { credentials: 'same-origin'}) 
			.then( (res) => {
				return res.json()
			} )
			.then( (res) => {
				this.carte_t = res
				this.nom_carte = ''
			} )
			.catch( function(error) {
				console.log('There has been a problem with initial fetch operation: ', error.message)
			})

		},
		ajouter_edition(){			

			let data = {
				code: this.code_edition,
				edition_name: this.nom_edition
			}

			fetch("/api/carte/edition", { 
				credentials: 'same-origin',
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			}) 
			.then( (res) => {

			  fetch("/api/carte/editions", { credentials: 'same-origin'}) //fetch les comm de user
			  .then( (res2) => {
			  	return res2.json()
			  } )
			  .then( (res2) => {
			  	this.editions = res2
			  } )
			  .catch( function(error) {
			  	console.log('There has been a problem with following fetch operation: ', error.message)
			  })

			} )
			.then( (res) => {
				this.nom_edition = ''
				this.code_edition = ''
			} )
			.catch( function(error) {
				console.log('There has been a problem with initial fetch operation: ', error.message)
			})

		}
	}


})