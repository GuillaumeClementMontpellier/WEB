
Vue.component('carte',{
	props: {
		nom:{
			type: String,
			required: true,
			default: 'Liliana\'s torment'
	    }
    },
    template: `
        <div>
            <img :src="image">

            <p> {{ nom }} est le nom de cette carte ! </p>

            <p v-if="score>10"> {{ score }}, Super note !</p>
            <p v-else-if="score>5"> {{score}},Bof </p>
            <p v-else> {{score}}, cetta note est nulle !</p>

            <ul> tags : 
              <li v-for="detail in details"> {{ detail }}</li>
            </ul>

            <button @click="augmenteNombre()"> Augmente un nombre !! </button>

            <review @review-submitted="addReview"></review>

            <div>

                <h3> Reviews : </h3>

                <p v-show="review.length == 0">Il n'y a pas de review</p>

                <p v-for="rev in review"> {{rev.name}} ({{rev.rating}}/5) : {{rev.comment}}</p>

            </div>

        </div>
        `,        
    data() {
    	return {
    	    image: 'https://img.scryfall.com/cards/art_crop/front/6/7/67aa7104-7acc-4827-b763-ac053c99baab.jpg?1555740652',
    	    score: 20,
    	    details: ["WAR","War of the spark"],
    	    nombre : 1,
    	    review: []
        }
    },
    methods: {
    	augmenteNombre() {
    		this.$emit('btnappuye', this.nombre)
    	},
    	addReview(rev){
    		this.review.push(rev)
    	}
    },
    computed:{
    	titre(){

    	    return this.nom 

    	}
    }
})

Vue.component('review',{
	template:` 
	<form @submit.prevent="onSubmit">

      <h3>Ajouter un commentaire : </h3>

      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>
      
      <p>
        <label for="comment">Commentaire:</label>      
        <textarea id="comment" v-model="comment"></textarea>
      </p>
      
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    
    
    </form>
	`,
	data(){
		return{
			name: null,
			comment: null,
			rating: null
		}
	},
	methods:{

		onSubmit(){

			let carteReview = {
				name: this.name,
				comment: this.comment,
				rating: this.rating
			}		

		    this.name = null
		    this.comment = null
		    this.rating = null

		    this.$emit('review-submitted', carteReview)

	    }

	}
})

var app = new Vue({

    el: '#app',
    data: {
    	nomCartes: ["Deliver onto Evil", ""],
    	nombre: 0
    },
    methods: {
    	augmenterNombre(nbr){
    		this.nombre += nbr
    	}
    }

})