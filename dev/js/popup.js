var api = "dc53d99ee0a45cb91d54c65d704b2185";

/*** Offer ***
Music offer class

@param  {string} – artist name
@param  {string} – artist photo url

@attr 'artist' 			{string} – current artist name
@attr 'image' 		 	{string} – current artist photo url
@attr 'songs'  			{array}  – array of songs
@attr 'limit'  			{number} – number of top songs from lastfm
@attr 'simParentBlock' 	{jQuery} – offers list container jquery element

@method 'addSong'	 – adding song into 'songs' array
@method 'isNewSong'  – check if song is in songs array	––return {bool}
@eethod 'debug'	 	 – logging offer info in console
@method 'fillSongs'  – adding top songs from lastfm 

@return {object} Offer object
***********/
function Offer(artist, image) {

	this.artist         = artist
	this.image          = image
	this.songs          = []
	this.simParentBlock = $("#similars")
	this.limit  = 5



	this.addSong = function(song) {

		if ( this.isNewSong(song) )
			this.songs.push( song );

		else
			console.warn("Song already exists")
	
	}



	this.isNewSong = function(song) {
		return true;
	}



	this.debug = function() {
		console.log( this.artist );

		_.each( this.songs, function(el) {
			
			if (el != null && el != undefined && el != "")
			{
				console.log("-> " + el);
			}

		});

		console.log("_______________");
	}



	this.fillSongs = function() {

		var that = this;

		var topSongs =
			"http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks" +
			"&limit=" 	+ limit +
			"&artist=" 	+ this.artist +
			"&api_key=" + api +
			"&format=json";

		$.get( topSongs, function(data, status) {

			var songsData = data.toptracks.track;

			_.each( songsData, function(el) {

				that.addSong( el.name );

			});

			that.debug();

		});
	}
}













/*** App ***
Main application class

@attr 'limit'  		{number} – number of top similar artists from lastfm
@attr 'offers' 		{array}  – object array of offers objects
@attr 'similars' 	{array}  – string array of similar artists
@attr 'currentSong' {object} – object with current playing song

@var global 'cur_artist' {jquery} – jquery element for current playing song's artist
@var global 'cur_title'  {jquery} – jquery element for current playing song's title
@var global 'cur_photo'  {jquery} – jquery element for current playing song's artist's photo

@method 'setLimit' 			– sets limit of similar artists
@method 'getCurrentSong' 	– returns current playing song ––return {object}
@method 'setCurrentSong' 	– replace this.currentSong with new song object
@method 'updateCurrent' 	– updates info about current playing song in popup.html
@method 'setCurrentPhoto' 	– getting photo from lastfm and set it into popup.html
@method 'getTopGroups' 		– getting top groups from lastfm and append them into this.similars

@return {object} Offer object
***********/
function App() {

	this.limit       = 5;
	this.similars    = [];
	this.offers      = [];
	this.currentSong = {}


	var
		cur_artist = $(".current__artist"),
		cur_title  = $(".current__title"),
		cur_photo  = $(".current__image img");



	this.setLimit = function(lim) {
		this.limit = lim;
	}



	this.getCurrentSong = function() {
		return this.currentSong;
	}



	this.setCurrentSong = function( data ) {
		if (this.currentSong !== data)
		{
			this.currentSong = data;
			this.updateCurrent();
		}
	}



	this.updateCurrent = function() {

		var otherArtist = cur_artist.text() != this.currentSong.artist
		var otherTitle  = cur_title.text()  != this.currentSong.title;

		if (otherArtist || otherTitle)
		{
			cur_artist.html( this.currentSong.artist );
		 	 cur_title.html( this.currentSong.title  );
			
			this.setCurrentPhoto();
		}

	}



	this.setCurrentPhoto = function() {
		var curRequest = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + this.currentSong.artist + "&api_key=" + api + "&format=json";

		$.get(curRequest, function(data,status) {
			if (status == "success")
			{
				if( data.artist.image != undefined)
				{
					var photoSrc = data.artist.image[2]["#text"];
					cur_photo.attr("src", photoSrc);
				}
				else
				{
					console.log("Photo not found");
				}
			}
			return;
		});

		this.getTopGroups();
	}



	this.getTopGroups = function() {

		var that = this;

		var topRequest =
			"http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar" + 
			"&artist=" 	+ this.currentSong.artist +
			"&limit=" 	+ that.limit +
			"&api_key=" + api +
			"&format=json";

		$.get( topRequest, function(data, status) {

			that.similars = data.similarartists.artist;
			setGroups( that.similars );

		});

		function setGroups( groups ) {

			_.each(groups, function(el, ind) {

				var tArtist = el.name;
				var tImage  = el.image[1]["#text"];

				var offer = new Offer( tArtist, tImage );

				offer.fillSongs();

			});

		}
	}

}

var app = new App();




$(window).load( function() {

	window.setInterval( function() {

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {method: "getMusic"}, function(response) {

				if (response)
				{
					app.setCurrentSong( response.data );
				}
				
			});
		});

	}, 500 );


	$("#similars").mCustomScrollbar({
					theme: 'dark-2',
		scrollbarPosition: 'inside'
	});

});