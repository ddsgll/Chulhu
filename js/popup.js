function ctulhu() {


	var currentSong = {
		artist: "",
		title: ""
	}


	var api = "dc53d99ee0a45cb91d54c65d704b2185";
	var limit = 5;


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


	this.setCurrentPhoto = function() {
		var curRequest = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + currentSong.artist + "&api_key=" + api + "&format=json";

		$.get(curRequest, function(data,status) {
			if (status == "success")
			{
				var photoSrc = data.artist.image[2]["#text"];
				cur_photo.attr("src", photoSrc);
			}
			return;
		});
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



	// return array with Band objects
	this.getTopGroups = function() {

		var groupsData;

		var topRequest =
			"http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar" + 
			"&artist=" 	+ currentSong.artist +
			"&limit=" 	+ limit +
			"&api_key=" + api +
			"&format=json";

		$.get( topRequest, function(data, status) {

			groupsData = data.similarartists.artist);
			console.log(groupsData);

		});
	}



	// return array with Song objects
	this.getPopularSongs = function( artist ) {
		
		var songsData;

		var topSongs =
		"http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks" +
		"&limit=" 	+ limit +
		"&artist=" 	+ artist +
		"&api_key=" + api +
		"&format=json";

		$.get( topSongs, function(data, status) {

			songsData = data.toptracks.track;
			console.log( songsData );

		});

	}
}





var c = new ctulhu();


















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

});