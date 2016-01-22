var api = "dc53d99ee0a45cb91d54c65d704b2185";
function chk(n) {console.log(n);}

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

	this.artist = artist;
	this.image  = image;
	this.songs  = [];
	this.limit  = 5;

	this.template = _.template(
    '<div class="similar">' +
        '<div class="similar__artist">' +
            '<div class="photo"><img src="<%= image %>" alt="<%= artist %>"/></div>' +
            '<div class="title"><%= artist %></div>' +
        '</div>' +
        '<div class="similar__songs">' +
            '<ul>' +
                '<%= songlist %>' +
            '</ul>' +
        '</div>' +
    '</div>');



	this.addSong = function(song) {

		if ( this.isNewSong(song) )
			this.songs.push( song );

		else
			console.warn("Song already exists");
	
	};



	this.isNewSong = function(song) {
		return true;
	};



	this.debug = function() {
		console.log( this.artist );

		_.each( this.songs, function(el) {
			
			if (el !== null && el !== undefined && el !== "")
			{
				console.log("-> " + el);
			}

		});

		console.log("_______________");
	};


	this.getHtmlTemplate = function() {
		var that = this;

		_.each(this.songs, function(el) {
			that.songlist +=
			'<li><a target="_blank" href="http://vk.com/search?c%5Bq%5D=' + that.artist +
			'%20%E2%80%93%20' + el +
			'&c%5Bsection%5D=audio">' + el + '</a></li>';
		});

		var string = this.template(this);

		return string;
	};



	this.fillSongs = function(callback) {

		var that = this;

		var request =
			"http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks" +
			"&limit=" 	+ this.limit  +
			"&artist=" 	+ this.artist +
			"&api_key=" + api 		  +
			"&format=json";

		$.ajax({
			method: 'get',
			   url: request
		})
		.done(function(data) {
			var songsData = data.toptracks.track;

			_.each( songsData, function(el) {
				that.addSong( el.name );
			});

			callback(that);
		});
	};
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

@method 'setCurrentSong' 	– replace this.currentSong with new song object
@method 'setCurrentArtist' 	– getting photo and tags from lastfm and create new object to this.currentSong
@method 'updateCurrent' 	– updates info about current playing song in popup.html

@method 'getTopGroups' 		– getting top groups from lastfm and append them into this.similars

@return {object} Offer object
***********/
function App() {
	
	this.limit       = 5;
	this.offers      = [];
	this.similars    = [];
	this.currentSong = {
		artist: '',
		title: ''
	};


	var
		cur_artist = $(".current__artist"),
		cur_title  = $(".current__title"),
		cur_photo  = $(".current__image img"),

		sim_block  = document.querySelector("#similars");



	this.setCurrentSong = function(data) {
		if (this.currentSong.artist !== data.artist || this.currentSong.title !== data.title )
		{
			this.setCurrentArtist( data.artist, data.title );
		}
	};



	this.setCurrentArtist = function(name, song) {
		var request =
			"http://ws.audioscrobbler.com/2.0/?method=artist.getinfo" +
			"&artist="  + name +
			"&api_key=" + api  +
			"&format=json";

		var that = this;

		$.ajax({
			method: "get",
			   url: request
		})
		.done(function(data) {

			var art = {
				artist: name,
				 title: song,
				 image: data.artist.image[2]["#text"],
				  tags: []
			};

			for (var i = 0; i < that.limit; i++)
			{
				var tag = data.artist.tags.tag[i].name;
				art.tags.push(tag);
			}

			that.currentSong = art;
			that.updateCurrent();

		});
	};



	this.updateCurrent = function() {
		var otherArtist = cur_artist.text() != this.currentSong.artist;
		var otherTitle  = cur_title.text()  != this.currentSong.title;

		if (otherArtist || otherTitle)
		{
			cur_artist.html(this.currentSong.artist 	 );
		 	 cur_title.html(this.currentSong.title  	 );
			 cur_photo.attr("src", this.currentSong.image);
		}
	};



	this.getTopGroups = function() {

		var that = this;

		var request =
			"http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar" + 
			"&artist=" 	+ this.currentSong.artist +
			"&limit=" 	+ this.limit 			  +
			"&api_key=" + api 					  +
			"&format=json";

		$.ajax({
			method: 'get',
			   url: request
		})
		.done(function(data) {
			that.similars = data.similarartists.artist;

			_.each(that.similars, function(el, ind) {

				var tArtist = el.name;
				var tImage  = el.image[1]["#text"];

				var offer = new Offer(tArtist, tImage);

				offer.fillSongs(function(offer) {
					var htmlString = offer.getHtmlTemplate();

					sim_block.innerHTML += htmlString.replace("undefined", "");
				});
			});
		});
	};


}


var app = new App();




$(window).load( function() {



	// Getting current playing song on vk
	window.setInterval( function() {

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {method: "getMusic"}, function(response) {

				if (response)
				{
					app.setCurrentSong( response.data );
				}
				
			});
		});

	}, 1000 );


});

var top5 = document.querySelector("#topfive");

top5.onclick = function(e) {

	app.getTopGroups();

}