var request = require("request");
var env = require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var inquirer = require("inquirer");
var moment = require('moment');
var colors = require("colors");
var getRandomJoke = require('one-liner-joke').getRandomJoke();

function inquire() {
    inquirer.prompt([
        {
            name: "function",
            type: "list",
            message: "What would you like me to do, Master?".blue,
            choices: ["Find Concert", "Spotify This Song", "Find Movie", "Dealer's Choice"],
        }
    ]).then(function (answer) {
        if (answer.function === "Find Concert") {
            bands();
        } else if (answer.function === "Spotify This Song") {
            spot();
        } else if (answer.function === "Find Movie") {
            movie();
        } else {
            doWhat();
        }
    })
}

inquire();

//bands in town API call function
function bands() {
    console.log("running bands module".yellow)
    inquirer.prompt([
        {
            name: "band",
            message: "Search a band/artist for an event near you.".blue,
        }
    ]).then(function (entry) {
        var search = entry.band;
        var results = [];
        request("https://rest.bandsintown.com/artists/" + search + "/events?app_id=codingbootcamp", function (error, response, body) {
            if (!error && response.statusCode === 200) {
                for (i = 0; i < JSON.parse(body).length; i++) {
                    var temp = {
                        venue: JSON.parse(body)[i].venue.name,
                        date: moment(JSON.parse(body)[i].datetime).format("MM-DD-YYYY"),
                        lineup: JSON.parse(body)[i].lineup,
                        location: JSON.parse(body)[i].venue.city + ", " + JSON.parse(body)[i].venue.region,
                    }
                    results.push(temp);
                }
                if (results.length === 0) {
                    console.log("No concerts found!".yellow)
                    setTimeout(mainMenu, 1000);
                } else {
                    inquirer.prompt([
                        {
                            name: "choice",
                            message: JSON.parse(body).length + " Upcoming events found. What would you like to do?".blue,
                            type: "list",
                            choices: ["Display all events", "Display upcoming event"],
                        }
                    ]).then(function (result) {
                        if (result.choice === "Display all events") {
                            console.log(results);
                            setTimeout(mainMenu, 1000);
                        } else {
                            var count = 0;
                            nextEvent();
                            function nextEvent() {
                                console.log(results[count]);
                                if (count < results.length - 1) {
                                    inquirer.prompt([
                                        {
                                            name: "next",
                                            message: "Display next event?".blue,
                                            type: "confirm",
                                        }
                                    ]).then(function (confirm) {
                                        if (confirm.next) {
                                            count += 1;
                                            nextEvent();
                                        } else {
                                            setTimeout(mainMenu, 1000);
                                        }
                                    })
                                } else {
                                    setTimeout(mainMenu, 1000);
                                }
                            }
                        }
                    })
                }
            }
        });
    })
}

//spotify API call function
function spot() {
    console.log("running spotify module".yellow)
    inquirer.prompt([
        {
            name: "song",
            message: "Please enter song name.".blue,
        }
    ]).then(function (entry) {
        var search = entry.song;
        if (!entry.song) {
            search = "The Sign - Ace of Base"
        }
        spotify
            .search({ type: 'track', query: search })
            .then(function (response) {
                console.log("Song Name: ".green + response.tracks.items[0].name);
                console.log("Artists: ".green + response.tracks.items[0].artists[0].name);
                console.log("Album: ".green + response.tracks.items[0].album.name);
                if (response.tracks.items[0].album.release_date_precision === "year") {
                    console.log("Year Published: ".green + response.tracks.items[0].album.release_date)
                } else {
                    console.log("Date Published: ".green + moment(response.tracks.items[0].album.release_date).format('MM/DD/YYYY'));
                }
                console.log(response.tracks.items[0].external_urls.spotify);
            }).then(function () {
                setTimeout(mainMenu, 1000);
            })
            .catch(function (err) {
                console.log(err);
            });
    })
}

//OMDB API call function
function movie() {
    console.log("running omdb module".yellow)
    inquirer.prompt([
        {
            name: "movie",
            message: "What movie would you like to search for?".blue,
        }
    ]).then(function (result) {
        if (!result.movie) {

        }
        var queryUrl = "http://www.omdbapi.com/?t=" + result.movie + "&y=&plot=short&apikey=trilogy";
        console.log(queryUrl);
        request(queryUrl, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var content = JSON.parse(body);
                console.log("Title - ".green + content.Title + "\nReleased In - ".green + content.Year + "\nIMDB Rating - ".green + content.imdbRating + "\nMetacritic Score - ".green + content.Metascore + "\nMovie Produced In - ".green + content.Country + "\nLanguage(s) - ".green + content.Language + "\nPlot - ".green + content.Plot + "\nActors - ".green + content.Actors);
            }else{
                console.log("No movies found, what are you smoking?".yellow);
            }
        })
    }).then(function () {
        setTimeout(mainMenu, 1000);
    })
}

//Custom LIRI function
function doWhat() {
    console.log("running random module".yellow)
    var rand = Math.ceil(Math.random()*3);
    var LIRI = {
        jokes: function(){
            console.log("---- Here's a random one liner ----".yellow);
            console.log((getRandomJoke.body).green);
            setTimeout(mainMenu, 1000);
        },
        eightBall: function(){
            var reply = ["It is certain.","As I see it, yes.","Reply hazy, try again","Don't count on it.","It is decidedly so.","Most likely.","Ask again later.","My reply is no.","Without a doubt.",
        "Outlook good.","Better not tell you now.","My sources say no.","Yes - definitely.","Yes.","Cannot predict now.","Outlook not so good","You may rely on it.","Signs point to yes.","Concentrate and ask again.","Very doubtful."]
            console.log("---- Magic Eight Ball ----".yellow);
            inquirer.prompt([
                {
                    name: "question",
                    message: "Ask magic eight ball a question!".blue,
                }
            ]).then(function(response){
                console.log("Your question - ".blue +response.question);
                console.log("Magic eight ball replies - ".green +reply[Math.floor(Math.random()*reply.length)])
            }).then(function(){
                setTimeout(mainMenu, 1000);
            })
        },
        blackJack: function(){
            var deck = [1,2,3,4,5,6,7,8,9,10,10,10,10,1,2,3,4,5,6,7,8,9,10,10,10,10,1,2,3,4,5,6,7,8,9,10,10,10,10,1,2,3,4,5,6,7,8,9,10,10,10,10]
            console.log("---- Playing a game of Blackjack ----".yellow);
            var playerSum;
            var dealerSum;
            var dealer1 = deck[Math.floor(Math.random()*deck.length)];
            deck.splice(deck.indexOf(dealer1),1);
            var dealer2 = deck[Math.floor(Math.random()*deck.length)];
            deck.splice(deck.indexOf(dealer2),1);
            var player1 = deck[Math.floor(Math.random()*deck.length)];
            deck.splice(deck.indexOf(player1),1);
            var player2 = deck[Math.floor(Math.random()*deck.length)];
            deck.splice(deck.indexOf(player2),1);
            dealerSum = dealer1 + dealer2;
            playerSum = player1 + player2;

            //checkplayer function
            function checkPlayer(){
                if((player1 === 1 || player2 === 1)&&(player1 === 10 || player2 === 10)){
                    console.log("Winner Winner Chicken Dinner! Black Jack!")
                    setTimeout(mainMenu, 1000);
                }
                if (playerSum < 21){
                    askHit();
                }else if (playerSum > 21){
                    console.log(playerSum + "! BUSTED!");
                    setTimeout(mainMenu, 1000);
                }else{
                    console.log("21! Can't get any better than this!");
                    dealerHit();
                }
            }

            //player hit function
            function askHit(){
                inquirer.prompt([
                    {
                        name: "hit",
                        message: playerSum + " is your total, hit or stay?".blue,
                        type: "list",
                        choices: ["Hit","Stay"],
                    }
                ]).then(function(reply){
                    if (reply.hit === "Hit"){
                        var temp = deck[Math.floor(Math.random()*deck.length)];
                        playerSum += temp;
                        deck.splice(deck.indexOf(temp),1);
                        checkPlayer();
                    }else if(reply.hit === "Stay"){
                        dealerHit();
                    }
                })
            }

            //dealer hit function
            function dealerHit(){
                console.log(dealerSum)
                if((dealer1 === 1 || dealer2 === 1)&&(dealer1 === 10 || dealer2 === 10)){
                    dealerSum = 21;
                    console.log("Dealer has 21!")
                }else{
                    function checkDealer(){
                        var temp = deck[Math.floor(Math.random()*deck.length)];
                        console.log("Dealer Draws "+temp);
                        dealerSum += temp;
                        console.log("Dealer Has "+dealerSum);
                        deck.splice(deck.indexOf(temp),1);
                        if (dealerSum > 21){
                            console.log("Dealer Busted! You Win!");
                            setTimeout(mainMenu, 1000);
                        }
                    }
                    while(dealerSum < 17){
                        checkDealer();
                        if (dealerSum > 16 && dealerSum < 21){
                            if (dealerSum > playerSum){
                                console.log("Dealer Wins!");
                                setTimeout(mainMenu, 1000);
                            }else if (playerSum > dealerSum){
                                console.log("You Win!");
                                setTimeout(mainMenu, 1000);
                            }else if (playerSum === dealerSum){
                                console.log("Push!");
                                setTimeout(mainMenu, 1000);
                            }
                        }
                    }
                }
            }
            checkPlayer();
        }
    }
    if (rand === 1){
        LIRI.jokes();
    }else if(rand === 2){
        LIRI.eightBall();
    }else{
        LIRI.blackJack();
    }
}

function mainMenu() {
    inquirer.prompt([
        {
            name: "confirm",
            type: "confirm",
            message: "Go back to main menu?".blue,
        }
    ]).then(function (result) {
        if (result.confirm) {
            inquire();
        } else {
            console.log("LIRI is shutting down.".yellow)
        }
    })
}