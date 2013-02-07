var sp;
var models;
var search;
var standardSearchParameters = {"pageSize":3, "searchArtists":false, "searchTracks": true, "searchAlbums":false};
var searchingArtist;
var artistsData;

function runSearch() {

    searchingArtist = artistsData.shift();

    if(searchingArtist) {

        console.log("> searching :",  searchingArtist);

        search = new models.Search('artist:"' + searchingArtist + '"', standardSearchParameters);
        search.localResults = models.LOCALSEARCHRESULTS.APPEND;
   
        var searchHTML = document.getElementById('search');

        search.observe(models.EVENT.CHANGE, function() {
            console.log("> " + searchingArtist + " <");
            $('#playlistDisplay > tbody:last').append('<tr scope="row" class="spec"><th colspan="2">' + searchingArtist + '</th></tr>');

            if(0 !== search.tracks.length) { 
              foundTracks.concat(search.tracks.slice(0));

              search.tracks.forEach(function(track) {
                //console.log(track);
                $('#playlistDisplay > tbody:last').append('<tr><td>' + track.name + '</td><td>' + timeFormat(track.duration) + '</td></tr>');

                foundTracks.push(track);
              });
            }

            if(artistsData.length) {
                runSearch();
            }

        });

        search.observe(models.EVENT.LOAD_ERROR, function() {
          console.error("Error loading", searchingArtist);
          if(artistsData.length) {
                runSearch();
            }
        });

        // Actually runs the search
        search.appendNext();
    }
}

function initSpotify() {
      /* Instantiate the global sp object; include models & views */
    sp = getSpotifyApi(1);
    models = sp.require('sp://import/scripts/api/models');
}

function createPlaylist(playlistTracks, name) {
    console.log(playlistTracks);

    var newFestivalPlaylist;

    if(name) {
        newFestivalPlaylist = new models.Playlist(name);
    } else {
        newFestivalPlaylist = new models.Playlist();
    }
    $.each(playlistTracks, function(index, value) { newFestivalPlaylist.add(value);});

    return newFestivalPlaylist;
}

function addSongsToPlayQueue() {
    var queuePlaylist = createPlaylist(foundTracks);
    models.player.play(queuePlaylist.uri, queuePlaylist.uri, 0);
    window.location = 'spotify:internal:playqueue';
}

function savePlaylist() {
    var savedPlaylist = createPlaylist(foundTracks, "Dev - Top 3");
}