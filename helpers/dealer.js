

const dealCards = (arr, gameObj) => {

    arr.forEach((card, index)=> {
        if(index %2 == 0){
            gameObj.player.push(card);
            gameObj.playerValue += card.value;
        }else{
            gameObj.dealer.push(card);
            gameObj.dealerValue += card.value;
        }
    })
    console.log(`inside deal DEALER TOTAL: ${gameObj.dealerValue}`)
    console.log(` inside deal PLAYER TOTAL: ${gameObj.playerValue}`)

}

const updateValue = (arr) =>{

    let updatedArr = arr.map((card)=> {

        switch(card.value){

            case "JACK":
                card.value = 10
                break
            case "QUEEN": 
                card.value = 10
                break
            case "KING":
                card.value = 10
                break
            case "ACE":
                card.value = 11
                break
            default:
                card.value = Number(card.value)
        }
        return card
    })
    return updatedArr
}

function chooseWinner(gameObj){

    if(gameObj.playerValue >= 22){
        gameObj.dealerWin = true;
        gameObj.playerWin = false;
    }
    else if(gameObj.dealerValue >= 22){
        gameObj.playerWin = true;
        gameObj.dealerWin = false;
    }
    else if(gameObj.playerValue > gameObj.dealerValue){
        gameObj.ooplayerWin = true;
        gameObj.dealerWin = false;
    }
    else if(gameObj.dealerValue > gameObj.playerValue){
        gameObj.dealerWin = true;
        gameObj.playerWin = false;
    }
}

module.exports = {
    updateValue,
    dealCards,
    chooseWinner
}