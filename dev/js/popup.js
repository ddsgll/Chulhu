var api = "dc53d99ee0a45cb91d54c65d704b2185";


function Offer(artist, image) {

	this.artist = artist
	this.image  = image
	this.songs = []
	this.simParentBlock = $("#similars")

	var limit  = 5


	this.addSong = function( song ) {
		if ( 1 ) {
			this.songs.push( song );
			// console.log("Added song '" + song + " to artist " + this.artist );
		}
		else {
			console.warn("Song already exists")
		}
	}

	this.debug = function() {
		console.log( this.artist );

		_.each( this.songs, function(el) {
			
			if(el != null && el != undefined && el != "") {
				console.log("-> " + el);
			}

		});

		console.log("_______________");
	}


	this.render = function() {

		var that = this;

		var parent = this.simParentBlock;
		var htmlString = "";

		htmlString += "<img src=" + this.image + ">";
		htmlString += "<h2>" + this.artist + "</h2>";
		htmlString += "<ul>"

		_.each( this.songs, function(el) {
			
			htmlString += "<li><a target='_blank' href='http://vk.com/search?c%5Bq%5D=" + that.artist + "%20%E2%80%93%20" + el + "&c%5Bsection%5D=audio'>" + el + "</a></li>";

		});

		htmlString += "</ul>";

		parent.html( htmlString );

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
			that.render();

		});
	}

}



function Ctulhu() {


	var currentSong = {
		artist: "",
		title: ""
	}


	var limit = 5;
	
	var similars = [];
	var offers = [];


	var cur_artist = $(".current__artist"),
		cur_title  = $(".current__title"),
		cur_photo  = $(".current__image img"),

		similarsBlock = $("#similars");



	





	this.setLimit = function( lim ) {
		limit = lim;
	}


	this.isChanged = function( obj ) {
		return currentSong !== obj
	}


	this.getCurrentSong = function() {
		console.log( currentSong.artist + " - " + currentSong.title );
	}


	this.setCurrentSong = function( data ) {
		if (currentSong !== data)
		{
			currentSong = data;
			this.updateCurrent();
		}
	}


	this.updateCurrent = function() {

		var otherArtist = cur_artist.text() != currentSong.artist
		var otherTitle  = cur_title.text()  != currentSong.title;

		if (otherArtist || otherTitle)
		{
			cur_artist.html( currentSong.artist );
		 	cur_title.html( currentSong.title );
			
			this.setCurrentPhoto();
		}

	}


	this.setCurrentPhoto = function() {
		var curRequest = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + currentSong.artist + "&api_key=" + api + "&format=json";

		$.get(curRequest, function(data,status) {
			if (status == "success")
			{
				var photoSrc = data.artist.image[2]["#text"];
				photoSrc != undefined ? cur_photo.attr("src", photoSrc) : console.log("No photo");
			}
			return;
		});

		this.getTopGroups();
	}



	// return array with Band objects
	this.getTopGroups = function() {

		var that = this;

		var topRequest =
			"http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar" + 
			"&artist=" 	+ currentSong.artist +
			"&limit=" 	+ limit +
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



	// return array with Song objects
	this.setPopularSongs = function( offer ) {

		var topSongs =
		"http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks" +
		"&limit=" 	+ limit +
		"&artist=" 	+ offer.artist +
		"&api_key=" + api +
		"&format=json";

		$.get( topSongs, function(data, status) {

			songsData = data.toptracks.track;

			offer.addSong

		});

	}
}





var c = new Ctulhu();


















$(window).load( function() {

	window.setInterval( function() {

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {method: "getMusic"}, function(response) {
				// console.log("sending...");

				// console.log("response: " + response.status );
				
				c.setCurrentSong( response.data );
				// musicData = response.data;
				// console.log("Playing: " + musicData.artist + " - " + musicData.title);
			});
		});

	}, 500 );


	$("#similars").mCustomScrollbar({
		theme: 'dark-2',
		scrollbarPosition: 'inside'
	});

});