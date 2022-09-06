let lookType = "playlists";
let replaceLink = "playlist";
let addAfter = "";
if (window.location.href.indexOf("collection/tracks") !== -1) {
    lookType = "me/tracks";
    replaceLink = "collection/tracks";
} else if (window.location.href.indexOf("collection/episodes") !== -1) {
    lookType = "me/episodes";
    replaceLink = "collection/episodes"
} else if (window.location.href.indexOf("collection/albums") !== -1) {
    replaceLink = "collection/albums";
    lookType = "me/albums";
} else if (window.location.href.indexOf("collection/podcasts") !== -1) {
    replaceLink = "collection/podcasts";
    lookType = "me/shows";
} else if (window.location.href.indexOf("/playlists/") !== -1) {
    lookType = "playlists";
    replaceLink = "playlist";
} else if (window.location.href.indexOf("/album/") !== -1) {
    lookType = "albums";
    replaceLink = "album";
} else if (window.location.href.indexOf("/discography/") !== -1) {
    replaceLink = "artist";
    lookType = "artists";
    addAfter = "/albums";
}
else if (window.location.href.indexOf("/artist/") !== -1) {
    lookType = "artists";
    replaceLink = "artist";
} else if (window.location.href.indexOf("/show/") !== -1) {
    lookType = "shows"
    replaceLink = "show";
} else if (window.location.href == "https://open.spotify.com/") {
    lookType = "me/player/recently-played";
    replaceLink = window.location.href;
}

let getToken = document.body.innerHTML.substring(document.body.innerHTML.indexOf("\"accessToken\":\"")).replace("\"accessToken\":\"", "");
getToken = getToken.substring(0, getToken.indexOf("\""));
console.log("ciao: " + getToken);
let playlistId = window.location.href.substring(window.location.href.indexOf(replaceLink)).replace(replaceLink, "");
if (addAfter.indexOf("/albums") !== -1) {
    playlistId = playlistId.substring(0, playlistId.indexOf("/discography"));
}
if (playlistId.indexOf("?") !== -1) {
    playlistId = playlistId.substring(0, playlistId.indexOf("?"));
}
console.log(lookType);
console.log(playlistId);
console.log(addAfter);
let fetchPlaylistData = "https://api.spotify.com/v1/" + lookType + playlistId + addAfter;
let playlistJson = "";
let playlistName = "";
function getData() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", fetchPlaylistData, false);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.setRequestHeader("Accept", "application/json");
    xmlHttp.setRequestHeader("Authorization", "Bearer " + getToken);
    xmlHttp.send(null);
    playlistJson = playlistJson + xmlHttp.responseText + "\n";
    if (xmlHttp.responseText.indexOf("\"next\" : \"") !== -1) {
        let getNext = xmlHttp.responseText.substring(xmlHttp.responseText.indexOf("\"next\" : \"")).replace("\"next\" : \"");
        getNext = getNext.substring(0, getNext.indexOf("\""));
        fetchPlaylistData = getNext.substring(getNext.indexOf("https://"));
        getData();
    } else {
        playlistName = playlistJson;
        if (lookType.indexOf("album") !== -1) {
            playlistName = playlistName.substring(playlistName.indexOf("\"label\" : \"")).replace("\"label\" : \"", "");
        }
        if (lookType.startsWith("shows")) {
            playlistName = playlistName.substring(playlistName.indexOf("\"media_type\" : \"")).replace("\"media_type\" : \"", "");
        }
        if (lookType.startsWith("me/")) {
            playlistName = "My saved " + lookType.replace("me/", "");
        } else {
            playlistName = playlistName.substring(playlistName.indexOf("\"name\" : \""));
            playlistName = playlistName.replace("\"name\" : \"", "");
            playlistName = playlistName.substring(0, playlistName.indexOf("\""));
        }
        console.log(playlistName);
        console.log(playlistJson);
        forceDownload('data:text/plain;charset=utf-8,' + encodeURIComponent(playlistJson), playlistName + "-exported.json");
    }
}
function forceDownload(url, fileName) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
}
getData();
