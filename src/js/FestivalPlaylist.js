require(['js/jquery','$api/models', '$api/search', '$views/list', '$views/buttons'], function(jQuery,Models, Search, List, Buttons) {

  var DataProxy = function(){

    var festivalName;
    var festivalData;
    var stageNames;
    var stageData;

    this.loadNames = function loadNames(callback){
      $.getJSON('data/festivals.json', function(data) {
        var festivalItems = [];
        $.each(data, function(key, val) {
          festivalItems.push({"id": val.id, "name":val.name});
        });

        callback(festivalItems);
      });
    };

    this.loadStages = function loadStages(festival, callback) {
      festivalName = festival;

      var dataURL = 'data/' + festival + ".json";
      $.getJSON(dataURL, function(data) {

        var stageItems = [];
        stageData = {};
  
        $.each(data, function(key, val) {
          stageItems.push({"id": val.name, "name":val.name});

          stageData[val.name] = val.events;
        });

        callback(stageItems);
      });

    };

    this.loadBands = function loadBands(stages, callback) {
      var artistsData = [];

      $.each(stages, function(key, stage) {
        $.each(stageData[stage], function(key, band) {
          artistsData.push(band.name);
        });
      });

      callback(artistsData);
    };

  };

  var SpotifyProxy = function(){

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

    var artistsData;
    var foundTracks;
    var searchingCallback;
    var MAX_SONGS = 1;

    var PLAYLIST_SETTINGS = {
      height: 'fixed',
      fields: ['nowplaying', 'star', 'track', 'artist', 'time', 'album', 'popularity'],
      style: 'rounded'
    };

    this.startSearch = function startSearch(bands, callback) {

      var savedTracks = [];
      var promises = [];

      // Using the snapshot of the search, create a number of promises to resolve into search results

      bands.forEach(function(band) { promises.push( Search.Search.search('artist:"' + band + '"').tracks.snapshot(0,MAX_SONGS) ); });

      // Fulfil the promises, and add the results into the save tracks storate
      Models.Promise.join(promises)
          .each(function(snapshot) { var snapshotResult = snapshot.toArray(); if(snapshotResult.length === 0) {console.log('Failed to find', snapshot._collection._args);} else {savedTracks = savedTracks.concat(snapshotResult);}})
          .done(function(tracks) {  })
          .fail(function(tracks) { console.log('Failed to load at least one track.', tracks); })
          .always(function(tracks) { callback(savedTracks);});
    };

    this.getEmptyPlaylist = function getEmptyPlaylist() {
      var returnPlaylist;
      var playlistPromise = new Models.Promise();

      Models.Playlist.createTemporary()
        .done(
          function(tempPlaylist) {
            returnPlaylist = tempPlaylist;
            return tempPlaylist.load('name', 'tracks', 'subscribed');
          })
        .done(
          function(loadedPlaylistToClear){
           return loadedPlaylistToClear.tracks.clear();
          })
        .done(
          function(clearedPlaylist) {
            playlistPromise.setDone(returnPlaylist);
          }
        ).fail(
          function(fail) {
          playlistPromise.setFail();
          }
        );


      return playlistPromise;
    };

    this.createPlaylistFromTracks = function createPlaylistFromTracks(tracks, callback) {
      var returnPlaylist;
      this.getEmptyPlaylist().done(
        function(workingPlaylist) {
          return workingPlaylist.load('name', 'tracks', 'subscribed');
        })
      .done(
        function(loadedPlaylist) {
          returnPlaylist = loadedPlaylist;
          return loadedPlaylist.tracks.add(tracks);
        })
      .done(
        function(playlistWithTracks) {
          callback(returnPlaylist); // playlistWithTracks is a collection
        });
    };

    this.createGridFromPlaylist = function createGridFromPlaylist(playlist, gridList, callback) {
      var generatedList;

      if(gridList) {
        generatedList = gridList;
        generatedList.refresh();
      } else {
        generatedList = List.List.forPlaylist(playlist, PLAYLIST_SETTINGS);
      }

      callback(generatedList);
    };

    this.createSubscribeButtonFromPlaylist = function createSubscribeButtonFromPlaylist(playlist, callback) {
      var subscribeButton = Buttons.SubscribeButton.forPlaylist(playlist);

      callback(subscribeButton);
    };

    this.subscribeToPlaylist = function subscribeToPlaylist(playlistToCopy, playlistName, playlistDescription) {

      var playlistTracks = [];

      playlistToCopy.load('name','tracks')
        .done(function(playlist){
          playlist.tracks.snapshot(0, 500).done(function(snapshot) {
            var len = Math.min(snapshot.length, 500);
            for (var i = 0; i < len; i++) {
              playlistTracks.push(snapshot.get(i));
            }
          });});

      Models.Playlist.create(playlistName)
        .done(
          function(createdPlaylist) {
            return createdPlaylist.setDescription(playlistDescription);
          })
        .done(
          function(createdPlaylistWithDescription) {
            return createdPlaylistWithDescription.load('name', 'tracks', 'subscribed');
          })

        .done(
            function(createdPlaylistToAddTo) {
              return createdPlaylistToAddTo.tracks.add(playlistTracks);
            })
        .done(
          function(filledPlaylist) {
            filledPlaylist.subscribed = true;
          });
    };
  };

  exports.DataProxy = DataProxy;
  exports.SpotifyProxy = SpotifyProxy;

});