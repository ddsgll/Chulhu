function getMusic() {

	var artist, title;

	var ac_artist = document.querySelector("#ac_performer");
	var ac_title  = document.querySelector("#ac_title");

	var gp_artist = document.querySelector("#gp_performer");
	var gp_title  = document.querySelector("#gp_title");

	var pd_artist = document.querySelector("#pd_performer");
	var pd_title  = document.querySelector("#pd_title");

	var ai_artist = document.querySelector(".ai_current .ai_artist");
	var ai_title  = document.querySelector(".ai_current .ai_title");

	if (gp_artist != undefined  &&  gp_title != undefined)
	{
		artist = gp_artist.innerHTML;
		title  = gp_title.innerHTML;
	}
	else if (ac_artist != undefined  &&  ac_title != undefined)
	{
		artist = ac_artist.innerHTML;
		title  = ac_title.innerHTML;
	}
	else if (pd_artist != undefined  &&  pd_title != undefined)
	{
		artist = pd_artist.innerHTML;
		title  = pd_title.innerHTML;
	}
	else if (ai_artist != undefined  &&  ai_title != undefined)
	{
		artist = ai_artist.innerHTML;
		title  = ai_title.innerHTML;
	}
	else {
		return false;
	}





	if ( artist && title ) {
		console.log("Playing: " + artist + " — " + title);
		return {artist: artist, title: title};
	}
	else {
		console.log("No music playing");
		return false;
	}
}

window.onload = function() {

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {

			if (request.method == "getMusic")
			{
				var data = getMusic();
				sendResponse({status: "ready", data: data});
			}

		}
	);

	window.setInterval( getMusic, 1000 );

}