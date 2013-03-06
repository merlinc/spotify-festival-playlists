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
          festivalItems.push({"id": val.data, "name":val.festival});
        });

        callback(festivalItems);
      });
    };

    this.loadStages = function loadStages(festival, callback) {

      festivalName = festival;

      var dataURL = 'data/' + festival;
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

      console.log(stageData[stages]);
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
      console.log(bands);

      var savedTracks = [];
      var promises = [];

      // Using the snapshot of the search, create a number of promises to resolve into search results

      bands.forEach(function(band) { promises.push( Search.Search.search(band).tracks.snapshot(0,MAX_SONGS) ); });

      // Fulfil the promises, and add the results into the save tracks storate
      Models.Promise.join(promises)
          .each(function(snapshot) { savedTracks = savedTracks.concat(snapshot.toArray());}) //snapshot.loadAll('name').done( function(loadedTracks) { console.log("Loaded:",loadedTracks.length); tracks.concat(loadedTracks.slice());});})
          .done(function(tracks) {  })
          .fail(function(tracks) { console.log('Failed to load at least one track.', tracks); })
          .always(function(tracks) { console.log("Found:", savedTracks.length); callback(savedTracks);});
    };

    this.getEmptyPlaylist = function getEmptyPlaylist() {
      var returnPlaylist;
      var playlistPromise = new Models.Promise();

      Models.Playlist.createTemporary()
        .done(
          function(tempPlaylist) {
            console.log("Created temporary:", tempPlaylist);
            returnPlaylist = tempPlaylist;
            return tempPlaylist.load('name', 'tracks', 'subscribed');
          })
        .done(
          function(loadedPlaylistToClear){
            console.log("Loaded temporary:", loadedPlaylistToClear);
           return loadedPlaylistToClear.tracks.clear();
          })
        .done(
          function(clearedPlaylist) {
            console.log("Returning temporary:", clearedPlaylist);
            console.log("Returning:", returnPlaylist);
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
          console.log("Working Playlist", workingPlaylist);
          return workingPlaylist.load('name', 'tracks', 'subscribed');
        })
      .done(
        function(loadedPlaylist) {
          console.log("Loaded Playlist", loadedPlaylist);
          returnPlaylist = loadedPlaylist;
          return loadedPlaylist.tracks.add(tracks);
        })
      .done(
        function(playlistWithTracks) {
          console.log("Playlist Tracks", playlistWithTracks);
          callback(returnPlaylist); // playlistWithTracks is a collection
        });
    };

      this.createGridFromPlaylist = function createGridFromPlaylist(playlist, gridList, callback) {
        console.log("Playlist:", playlist, "Gridlist:", gridList);
        var generatedList;

        if(gridList) {
          console.log("Refreshing");
          generatedList = gridList;
//          generatedList.setItem(playlist.snapshot());
          generatedList.refresh();
        } else {
          console.log("Creating");
          generatedList = List.List.forPlaylist(playlist, PLAYLIST_SETTINGS);
        }

        callback(generatedList);
      };
    };




  exports.DataProxy = DataProxy;
  exports.SpotifyProxy = SpotifyProxy;

});

/*

SpotiftyDesktop
  .Festivals
    .loadNames(, callback)
    .loadStages(festival, callback)
    .loadBands(festival, [stage], callback)
  .Spotify
    .search([band],callback)

  .UIx
    .updateFestivals([festival])
    .updateStages([stage])
    .updateBands([band])
    .updatePlaylist(List)
    .subscribeToPlaylist(List)
*/