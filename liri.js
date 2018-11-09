//All my packages i will be needing 
const moment = require("moment")
const Spotify = require('node-spotify-api');
var request = require("request");
const fs = require("fs");

//Importing data from my files
const env = require("dotenv/config")
const keys = require("./keys.js")

//Variable holds my spotify ID
const spotify_id = keys.spotify.id

//Variable holds my spotify secret
const spotify_secret = keys.spotify.secret

//variable holds my MODB API key
const OMDB_id = keys.OMDB.API

//Variable holds my BandsInTown API key
const bandsAPI = keys.bands.id

//varibale holds what they want to do 
const choice = process.argv[2];

// variable holds the user value for whatever function they call
const name = process.argv.slice(3).join(" ");

// switch case to determine what functions to run depending on user
switch (choice) {
    case "concert-this":
        concertThis(bandsAPI, name);
        break;
    case "spotify-this-song":
        spotifyThisSong(spotify_id, spotify_secret, name);
        break;
    case "movie-this":
        movieThis(OMDB_id, name);
        break;
    default:
        fs.readFile("random.txt", "utf8", function (error, data) {

            // If the code experiences any errors it will log the error to the console.
            if (error) {
                return console.log(error);
            }
            spotifyThisSong(spotify_id, spotify_secret, data);
        });
}

//this function will connect me with BandsInTown API
function concertThis(id, artist) {
    //Creating my url request
    let urlRequest = {
        method: 'GET',
        url: 'https://rest.bandsintown.com/artists/' + artist + '/events',
        qs: { app_id: id },

    };
    //making request to BandsInTown
    request(urlRequest, function (error, response, body) {
        if (error) throw new Error(error);
        const band = JSON.parse(body)

        // displaying artist they typed in
        console.log(`Here is your information for ${artist}`)
        console.log("\nEvents\n---------------")

        //Loop to iterate over every event artist has
        for (let i = 0; i < band.length; i++) {
            console.log(`Venue: ${band[i].venue.name}\nLocation: ${band[i].venue.city}, ${band[i].venue.region}\nDate: ${moment(band[i].datetime).format("l")}\n`)
        }
    });
}

//function to connect with Spotify
function spotifyThisSong(id, secretId, song) {


    const spotify = new Spotify({
        id: id,
        secret: secretId,
    });

    //making spotify request for User song
    spotify.request("https://api.spotify.com/v1/search?query=" + song + "&type=track&offset=0&limit=5").then(function (response) {

        //loop to iterate over 10 songs from user search
        for (let i = 0; i < 10; i++) {
            const artist = response.tracks.items[i].artists
            console.log(`Here is the info for ${song}`)
            console.log("----------\n")
            console.log("Artist:")
            artist.forEach(function (artist) {
                console.log(artist.name)
            })
            console.log("Album:", response.tracks.items[i].album.name)
            console.log("Link Preview:", response.tracks.href)
        }
    }).catch(function (err) {
        console.error('Error occurred: ' + err);
    });
}

//function to connect with OMDB API
function movieThis(OMDB_id, movieTitle) {
    //creating my url request
    var urlRequest = {
        method: 'GET',
        url: 'http://www.omdbapi.com/',
        qs: { apikey: OMDB_id, t: movieTitle, type: 'movie' },
    };

    //making request to OMDB to return user movie search
    request(urlRequest, function (error, response, body) {
        const movie = JSON.parse(body)
        if (error) throw new Error(error);
        console.log(`Here is your information for ${movie.Title}`)
        console.log(`\nRelease Year: ${movie.Year} \nIMDB Rating: ${movie.imdbRating} \nRotten Tomatoe Rating: ${movie.Ratings[2].Value} \nCountry Produced: ${movie.Country} \nPlot: \n ${movie.Plot} \nActors: \n ${movie.Actors}`)

    });
}