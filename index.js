const express = require('express');
const request = require('request');
const app = express();
const logger = require('morgan');
let {
	updateValue,
	dealCards,
	chooseWinner
} = require('./helpers/dealer');

app.set('view engine', 'ejs');
app.use(express.static('public'));
// Foundation


// Player Variables

let gameData = {
	player: [],
	dealer: [],
	playerValue: 0,
	dealerValue: 0,
	playerWin: false,
	dealerWin: false
}




let baseURL = 'https://deckofcardsapi.com/api/deck/';

let deckId = "";

//ROUTE HANDLERS

//ROOT ROUTE
app.get('/', (req, res) => {
	res.render('home')
})

//GET DECK OF CARDS
app.post('/blackjack', (req, res, next) => {

	// Clear gameData
	gameData.player = [];
	gameData.dealer = [];
	gameData.playerValue = 0;
	gameData.dealerValue = 0;
	gameData.playerWin = false;
	gameData.dealerWin = false;
	
	// Amounts of cards to draw
	let deck_count = 6;
	let endpoint = `${baseURL}new/shuffle/?deck_count=${deck_count}`;

	request(endpoint, (error, response, body) => {

		if (!error && response.statusCode == 200) {

			let deck = JSON.parse(body)
			// Add the deckID 
			deckId = deck.deck_id;
			console.log('DECK HERE:', deck);
			// Trigger next route
			next();
		} else {
			res.render('error', { error: 'Oops something went wrong!~' })
		}
	})
})

//DEAL CARDS FROM DECK & REDIRECT TO /BLACKJACK
app.post('/blackjack', (req, res) => {

	
	// Next route fires
	let drawCount = 4;
	// trigger draw amount
	let endpoint = `${baseURL}${deckId}/draw/?count=${drawCount}`;

	request(endpoint, (error, response, body) => {

		if (!error && response.statusCode == 200) {
			let newCards = JSON.parse(body)
			// Got the cards now updating the values
			let updatedNewCards = updateValue(newCards.cards)
			// Need to deal cards - pass the cards and the gameData object
			dealCards(updatedNewCards, gameData)
			console.log(` in route DEALER TOTAL: ${gameData.dealerValue}`)
			console.log(` in route PLAYER TOTAL: ${gameData.playerValue}`)

			res.redirect('/blackjack')
		} else {
			res.render('error', { error: 'Oops something went wrong!~' })
		}
	})
})

//DISPLAYS BLACKJACK PAGE W/ DATA RECEIVED
app.get('/blackjack', (req, res) => {
	// Pull the arrays out of the object to render
	const { player, dealer } = gameData
	res.render('blackjack', { player, dealer })
})

//HIT
app.post('/hit', (req, res) => {
	// Amount of cards to draw
	let drawCount = 1;

	let endpoint = `${baseURL}${deckId}/draw/?count=${drawCount}`
	// Request to API - to grab the single card
	request(endpoint, (error, response, body) => {

		let data = JSON.parse(body)
		// Update the value of the card we just drew
		let updatedData = updateValue(data.cards)
		let hitCard = updatedData[0]
		// Add the card to the player array
		gameData.player.push(hitCard)
		// Add the value of the card to the player total value of cards
		gameData.playerValue += hitCard.value;

		//console.log("CURRENT DEALER HAND: ", dealer)
		//console.log("CURRENT PLAYER HAND: ", player)


		// Logic to check if there is a winner
		if (gameData.playerValue >= 22) {
			const { player, dealer, playerValue, dealerValue } = gameData
			res.render('results', { player, dealer, playerValue, dealerValue })
			console.log('---- hit ----')
			console.log(`PLAYER TOTAL: ${playerValue}`)
			console.log(`Sorry you busted with a total of ${playerValue}`)
		} else {
			const { player, dealer, playerValue, dealerValue } = gameData
			res.render('blackjack', { player, dealer })
			console.log('---- hit ----', hitCard.value)
			console.log(`PLAYER TOTAL: ${playerValue}`)
		}
	})
})

//STAY 
app.post('/stay', (req, res) => {

	console.log('---- stay ----')

	let drawCount = 1;

	let endpoint = `${baseURL}${deckId}/draw/?count=${drawCount}`

	request(endpoint, (error, response, body) => {

		let data = JSON.parse(body)
		let updatedData = updateValue(data.cards)
		let hitCard = updatedData[0]

		while (gameData.dealerValue <= 16) {
			console.log('---- dealer draws ----', hitCard.value)
			gameData.dealer.push(hitCard)
			gameData.dealerValue += hitCard.value;
			console.log('DEALER TOTAL: ', gameData.dealerValue)
		}

		// You could just send the entire gameData obj you would just have to modify your ejs
		// But instead just pulled the values out and sent them
		const { player, dealer, playerValue, dealerValue } = gameData
		console.log('---- dealer stays ----')
		console.log(`DEALER TOTAL: ${dealerValue}`)
		console.log(`PLAYER TOTAL: ${playerValue}`)
		res.render('results', { player, dealer, playerValue, dealerValue })
	})
})




//PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Now listening on port ${PORT}`))