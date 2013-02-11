var SpotifyProxy = (function() {

    var sp = getSpotifyApi(1);
    var models = sp.require('sp://import/scripts/api/models');
    var views = sp.require("sp://import/scripts/api/views");
    var ui = sp.require('$util/dnd');

    var search;
    var standardSearchParameters = {"pageSize":3, "searchArtists":false, "searchTracks": true, "searchAlbums":false};
    var searchingArtist;
    var artistsData;
    var foundTracks;

    var runSearch = function() {
      searchingArtist = artistsData.shift();

      if(searchingArtist) {

          search = new models.Search('artist:"' + searchingArtist + '"', standardSearchParameters);
          search.localResults = models.LOCALSEARCHRESULTS.APPEND;
     
          var searchHTML = document.getElementById('search');

          search.observe(models.EVENT.CHANGE, function() {
              console.log("Found: " + searchingArtist + "");

              foundTracks = foundTracks.concat(search.tracks.slice(0));

              search.tracks.forEach(function(track) {
  //              workingPlaylist.add(track);
              });

              if(artistsData.length){
                runSearch();
              } else {
                displayResults();
              }
          });

          search.observe(models.EVENT.LOAD_ERROR, function() {
            console.error("Not found:", searchingArtist);
            if(artistsData.length) {
                  runSearch();
              }
          });

          // Actually runs the search
          search.appendNext();
      }
  };

  var displayResults = function() {

    var pl = createPlaylist(foundTracks);
//    var pl = models.Playlist.fromURI("spotify:user:m3rlinc:playlist:6i9Hqmj8DIIJFP3KhDm1Cx");
    var list = new views.List(pl, function (track) {
    return new views.Track(track, views.Track.FIELD.STAR |
                views.Track.FIELD.NAME |
                views.Track.FIELD.ARTIST |
                views.Track.FIELD.DURATION |
                views.Track.FIELD.POPULARITY);
    });


    var player = new views.Player();
    player.context = pl;
     $('#addPlaylist').show();
    //$("#playerNode").empty();
    //$("#playerNode").append(player.node);
    $("#playlistNode").empty();
    $("#playlistNode").append(list.node);

  };
   
  var startSearch = function(artists) {
    artistsData = artists;
    foundTracks = [];
    runSearch();
  };

  var createPlaylist = function (playlistTracks, name) {
      var newFestivalPlaylist;

      if(name) {
          newFestivalPlaylist = new models.Playlist(name);
      } else {
          newFestivalPlaylist = new models.Playlist();
      }
      $.each(playlistTracks, function(index, value) { newFestivalPlaylist.add(value);});

      return newFestivalPlaylist;
  };

  var savePlaylist = function(playlistName) {
      var savedPlaylist = createPlaylist(foundTracks, "Festival Playlists - " + playlistName);
  };

  var applyOnlineOffline = function() {
    if(2 === models.session.state) {
          $('.offlineContainer').show();
          $('.container').hide();
      } else {
          $('.container').show();
          $('.offlineContainer').hide();
      }
  };

  applyOnlineOffline();
  models.session.observe(models.EVENT.STATECHANGED, applyOnlineOffline);
   
    // Return the object that is assigned to Module
    return {
        startSearch: startSearch,
        savePlaylist: savePlaylist
    };
}());
