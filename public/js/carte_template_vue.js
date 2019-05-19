

let app = new Vue({

	data: {
		editions: [],
		carte_t:[],
		nom_carte: ''

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

		}
	}


})