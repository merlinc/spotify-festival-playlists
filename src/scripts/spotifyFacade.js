require([
  '$api/models',
  '$api/search#Search',
  '$views/list#List',
  '$views/image#Image',
  'scripts/data'
], function(models, Search, List, Image, dataProxy) {
  'use strict';

  var spotifyProxy;// = new FestivalPlaylist.SpotifyProxy();
  var bandList;
  var MAX_SONGS = 2;
  var currentPlaylist;

  var list;

  var startSearch = function startSearch(bands, callback) {

    var savedTracks = [];
    var promises = [];

    // Using the snapshot of the search, create a number of promises to resolve into search results

    bands.forEach(function(band) {
      promises.push( Search.search('artist:"' + band + '"').tracks.snapshot(0,MAX_SONGS));
    });

    // Fulfil the promises, and add the results into the save tracks storate
    models.Promise.join(promises)
        .each(function(snapshot) {
          var foundTracks = getTracksFromSnapshot(snapshot);
          savedTracks = savedTracks.concat(foundTracks);
        })
        .done(function(tracks) {
        })
        .fail(function(tracks) {
          console.log('Failed to load at least one track.', tracks);
        })
        .always(function(tracks) {
          console.log("Loaded", savedTracks.length, "tracks");
          callback(savedTracks);
        });
  };

    var updatePlayListWithTracks = function (tracks) {
      var returnPlaylist;
      var playlistPromise = new models.Promise();

//      models.Playlist.createTemporary('Festival Playlists')
      models.Playlist.create('Festival Playlists')
        .done(
          function(tempPlaylist) {
            console.log("Playlist created");
            returnPlaylist = tempPlaylist;
            return tempPlaylist.load('name', 'tracks', 'subscribed');
          })
        .done(
          function(tempPlaylist) {
            console.log("Playlist loaded");
            return tempPlaylist.tracks.clear();
          })
        .done(
          function(loadedPlaylistToAdd){
            console.log("Playlist cleared");
            return loadedPlaylistToAdd.tracks.add(tracks);
          })
        .done(
          function(addedPlaylist) {
            console.log("Playlist created");
            returnPlaylist = addedPlaylist;
            return addedPlaylist.load('name', 'tracks', 'subscribed');
          })
/*        .done(
          function(tempPlaylist) {
            console.log("Playlist reloaded");
            //returnPlaylist = tempPlaylist;
            return tempPlaylist.load('name', 'tracks', 'subscribed');
          })
          .done(
          function(tempPlaylist) {
          })
        .done(
          function(tempPlaylist) {
            console.log("Snapshotting");
            return tempPlaylist.tracks.snapshot();
          })
  */
        .done(
          function(loadedPlaylist) {
            console.log("Playlist reloaded", loadedPlaylist);
            playlistPromise.setDone(loadedPlaylist);
          })
        .fail(
          function(fail) {
          playlistPromise.setFail();
          }
        );

      return playlistPromise;
    };

  var getTracksFromSnapshot = function (snapshot) {
    var snapshotResult = snapshot.toArray();
    console.log("Results: ", snapshotResult.length);
    if(snapshotResult.length === 0) {
      //  console.log('Failed to find', snapshot._collection._args);
        return [];
    }
    return snapshotResult;
  };

  var refreshViewListWithPlaylist = function (playlist) {
    var playlistContainer = document.getElementById('playlistContainer');
    currentPlaylist = playlist;

    if(list) {
      list.setItem(currentPlaylist);
//      list.refresh();
    } else {
      list = List.forPlaylist(currentPlaylist);
      playlistContainer.appendChild(list.node);
      list.init();
    }
  };

  var onSessionOnlineChange = function(obj) {
    applyOnlineOffline(obj.target.online);
  };

  var applyOnlineOffline = function(onlineStatus) {
    if(onlineStatus) {
      console.log("ONLINE");
          $('.container').show();
          $('.offlineContainer').hide();
      } else {
        console.log("OFFLINE");
          $('.offlineContainer').show();
          $('.container').hide();
      }
  };

  var storedSession = new models.Session().load("online")
  .done(function(loadedSession) {
    loadedSession.addEventListener('change:online', onSessionOnlineChange);
    applyOnlineOffline(loadedSession.online);

    return loadedSession;
  });

  exports.startSearch = startSearch;
  exports.updatePlayListWithTracks = updatePlayListWithTracks;
  exports.refreshViewListWithPlaylist = refreshViewListWithPlaylist;
});
