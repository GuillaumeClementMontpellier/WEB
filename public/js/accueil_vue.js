"use strict"

let app = new Vue({

	el: '#app',
	data: {
		cartes_preview : []
	},

	created: function(){

		fetch("/api/carte/bytop?nbr=6")
		.then((response) => {
			return response.json();
		})
		.then((reponseJSON) => {
			this.cartes_preview=reponseJSON;
		});

	}

})