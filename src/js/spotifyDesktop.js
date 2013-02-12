//['$api/models', '$views/image#Image'], function(models, Image)
//Inside b.js:
require(['js/jquery','$api/models', '$api/search#Search', '$views/list#List'], function(jquery,Models, Search, List) {
/*
    var sp = getSpotifyApi(1);
    var models = sp.require('sp://import/scripts/api/models');
    var views = sp.require("sp://import/scripts/api/views");
    var ui = sp.require('$util/dnd');
*/
    var currentSearch;
    var standardSearchParameters = {"pageSize":3, "searchArtists":false, "searchTracks": true, "searchAlbums":false};
    var searchingArtist;
    var artistsData;
    var foundTracks;

    var runSearch = function() {
      searchingArtist = artistsData.shift();

      if(searchingArtist) {
/*
        require(['$api/models'], function(models) {
  var maxItems = 5,
      album = models.Album.fromURI('spotify:album:0hljn4caZCf6xPILpLDJkB');
  album.load('tracks', 'artists').done(function(a) {
    a.tracks.snapshot(0, maxItems).done(function(snapshot) {
      for (var i = 0, l = Math.min(snapshot.length, maxItems); i < l; i++) {
        var track = snapshot.get(i);
        console.log(track.artists[0].uri, track.uri);
    }).fail(function(){
        console.error('Error retrieving snapshot');
    });
  }).fail(function(){
      console.error('Error retrieving album information');
  });
});
*/
          currentSearch = Search.search(searchingArtist);//standardSearchParameters);
//          currentSearch.localResults = models.LOCALSEARCHRESULTS.APPEND;
     
          currentSearch.tracks.snapshot(0,3).done(function(tracks) {
              console.log("Found: " + searchingArtist + "");

              foundTracks = foundTracks.concat(tracks.toArray());

              if(artistsData.length){
                runSearch();
              } else {
                displayResults();
              }
          });
/*
          currentSearch.observe(models.EVENT.LOAD_ERROR, function() {
            console.error("Not found:", searchingArtist);
            if(artistsData.length) {
                  runSearch();
              }
          });
*/
      }
  };

  var displayResults = function() {

    Models.Playlist.createTemporary().done(function(tempPlaylist) {
      tempPlaylist.load('name', 'tracks').done(function(loadedPlaylist) {
        loadedPlaylist.tracks.add(foundTracks).done(function(playlistWithTracks) {
          //Models.Playlist.fromURIs(foundTracks);
          var list = List.forPlaylist(playlistWithTracks, {"fields":['nowplaying', 'star', 'track', 'artist', 'time', 'popularity'], "unplayable": "disabled", "throbber": "hide-content"});

          $("#playlistNode").empty();
          $("#playlistNode").append(list.node);

          list.init();
        });
      });
      
    });

  };
   
  var startSearch = function(artists) {
    artistsData = artists;
    foundTracks = [];
    runSearch();
  };

  var createPlaylist = function (playlistTracks, name) {
      var newFestivalPlaylist;

      if(name) {
          newFestivalPlaylist = Models.Playlist(name);
      } else {
          newFestivalPlaylist = Models.Playlist();
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

  //applyOnlineOffline();
  //models.session.observe(models.EVENT.STATECHANGED, applyOnlineOffline);
   
    // Return the object that is assigned to Module
//    return {
//        startSearch: startSearch,
//        savePlaylist: savePlaylist
//    };

  exports.startSearch = startSearch;
  exports.savePlaylist = savePlaylist;

});
