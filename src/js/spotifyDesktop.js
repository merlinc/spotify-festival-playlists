require(['js/jquery','$api/models', '$api/search#Search', '$views/list#List', '$views/buttons#SubscribeButton'], function(jquery,Models, Search, List, SubscribeButton) {
/*
    var sp = getSpotifyApi(1);
    var models = sp.require('sp://import/scripts/api/models');
    var views = sp.require("sp://import/scripts/api/views");
    var ui = sp.require('$util/dnd');
*/
    var standardSearchParameters = {"pageSize":3, "searchArtists":false, "searchTracks": true, "searchAlbums":false};
    var playlistSettings = {
    height: 'fixed',
    fields: ['nowplaying', 'star', 'track', 'artist', 'time', 'album', 'popularity'],
    style: 'rounded',
    throbber: 'hide-content'
  };

    var currentSearch;
    var searchingArtist;
    var artistsData;
    var foundTracks;
    var MAX_SONGS = 1;

    var generatedList;

    var festivalPlaylist;

    var subscribeButton;

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
     
          currentSearch.tracks.snapshot(0,MAX_SONGS).done(function(tracks) {
              console.log("Found: " + searchingArtist + "");

              foundTracks = foundTracks.concat(tracks.toArray());

              if(artistsData.length){
                runSearch();
              } else {
                displayResults();
              }
          })
          .fail(function() {
            console.error("Error retrieving tracks");
          });
      }
  };

  var displayResults = function() {

//    $("#playlistNode").empty();
    
    Models.Playlist.createTemporary(Math.random())
    .done(function(tempPlaylist) {
      tempPlaylist.load('name', 'tracks', 'subscribed');
    })
    .done(function(loadedPlaylist) {
      storePlaylist(loadedPlaylist);
      loadedPlaylist.tracks.add(foundTracks)
    .done(function(playlistWithTracks) {

        applyPlaylistToList(playlistWithTracks);
        applyPlaylistToSubscribeButton(loadedPlaylist);


      });
    });
  };

  var storePlaylist = function(playlist) {
            festivalPlaylist = playlist;
  };

  var applyPlaylistToList = function(playlist) {
        if(generatedList) {
          generatedList.setItem(playlist);
          generatedList.refresh();
        }
        else {
          generatedList = List.forPlaylist(playlist, playlistSettings);
          $("#playlistNode").append(generatedList.node);
          generatedList.init();
        }

  };

  var applyPlaylistToSubscribeButton = function(playlist) {
    playlist.subscribed = true;
    subscribeButton = SubscribeButton.SubscribeButton.forPlaylist(playlist);
    $('.playlistContainer').prepend(subscribeButton.node);

    subscribeButton.addEventListener('click', toggleSubscription);

    renderText();
  };

  var toggleSubscription = function() {
    festivalPlaylist.subscribed = !festivalPlaylist.subscribed;
    renderText();
  };

  var renderText = function() {
    subscribeButton.node.innerText = festivalPlaylist.subscribed ? 'Unsubscribe from playlist' : 'Subscribe to playlist';
  };

/*
    Models.Playlist.createTemporary().done(function(tempPlaylist) {
      tempPlaylist.load('name', 'tracks').done(function(loadedPlaylist) {
        loadedPlaylist.tracks.add(foundTracks).done(function(playlistWithTracks) {

          console.log(playlistWithTracks);

          generatedList = List.forPlaylist(playlistWithTracks, {"fields":['nowplaying', 'star', 'track', 'artist', 'time', 'popularity'], "unplayable": "disabled", "throbber": "hide-content"});

          $("#playlistNode").append(generatedList.node);

          generatedList.init();
        });
      });
      
    });
*/
   
  var startSearch = function(artists) {
    artistsData = artists;
    foundTracks = [];

    if(generatedList) {
//      generatedList.clear();
    }

    runSearch();
  };

  /*
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
  */


  var savePlaylist = function(playlistName) {
//      var savedPlaylist = createPlaylist(foundTracks, "Festival Playlists - " + playlistName);

    var savedPlaylist = Models.Playlist.create("Festival Playlists - " + playlistName).done(function(createdPlaylist) {
      createdPlaylist.setDescription("Playlist for all songs at " + playlistName).done(function(describedPlaylist) {
        console.log("Described Playlist", describedPlaylist);
        describedPlaylist.load('name', 'tracks').done(function (loadedPlaylist){
          console.log("Load Playlist", loadedPlaylist);
          loadedPlaylist.tracks.add(foundTracks).done(function(completedPlaylist){
            console.log("Completed Playlist", completedPlaylist);


//            var playlist = models.Playlist.fromURI(completedPlaylist.uri);

          });
        });
      });
    });
  };


  var onSessionOnlineChange = function(obj) {
    applyOnlineOffline(obj.target.online);
  };

  var applyOnlineOffline = function(onlineStatus) {
    if(onlineStatus) {
          $('.container').show();
          $('.offlineContainer').hide();
      } else {
          $('.offlineContainer').show();
          $('.container').hide();
      }
  };

  var storedSession = new Models.Session().load("online")
    .done(function(loadedSession) {
      loadedSession.addEventListener('change:online', onSessionOnlineChange);
      applyOnlineOffline(loadedSession.online);

      return loadedSession;
    });




  exports.startSearch = startSearch;
  exports.savePlaylist = savePlaylist;

});

describe('Spotify Desktop', function(){
    console.log("Tests enabled");
});
