require(['js/jquery','$api/models', '$api/search', '$views/list', '$views/buttons'], function(jQuery,Models, Search, List, Buttons) {

  var Festivals = function(){

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
      style: 'rounded',
      throbber: 'hide-content'
    };

    this.startSearch = function startSearch(bands, callback) {
      console.log(bands);

      var savedTracks = [];
      var promises = [];

      bands.forEach(function(band) { promises.push( Search.Search.search(band).tracks.snapshot(0,3) ); });

      Models.Promise.join(promises)
          .each(function(snapshot) { console.log("Results:", snapshot.toArray()); savedTracks = savedTracks.concat(snapshot.toArray());}) //snapshot.loadAll('name').done( function(loadedTracks) { console.log("Loaded:",loadedTracks.length); tracks.concat(loadedTracks.slice());});})
          .done(function(tracks) { console.log("Tracks:", savedTracks); })
          .fail(function(tracks) { console.log('Failed to load at least one track.', tracks); })
          .always(function(tracks) { console.log("Completed"); callback(savedTracks);});
    };

    this.createPlaylistFromTracks = function createPlaylistFromTracks(tracks, callback) {
      Models.Playlist.create(Math.random())
        .done(function(tempPlaylist) {
          tempPlaylist.load('name', 'tracks', 'subscribed');
        })
        .done(function(loadedPlaylist) {
          loadedPlaylist.tracks.add(foundTracks)
        .done(function(playlistWithTracks) {
          callback(loadedPlaylist);
        });
        });
      };

      this.createGridFromPlaylist = function createGridFromPlaylist(playlist, gridList, callback) {
        var generatedList;

        if(gridList) {
          generatedList = gridList;
          generatedList.setItem(playlist);
        } else {
          generatedList = List.List.forPlaylist(playlist, PLAYLIST_SETTINGS);
        }

        callback(generatedList);
      };
    };




  exports.Festivals = Festivals;
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