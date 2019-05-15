"use strict"

let app = new Vue({

	el: '#app',
	data: {
		cartes_preview : []
	},

	created: function(){ 
		fetch("/api/carte/bytop?nbr=6")
		.then(r => r.json())
		.then(json => {
			this.json=json;
		});

	}

})