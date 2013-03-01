// Start the main app logic.
require(['$api/models', 'js/FestivalPlaylist'],
function   ($models, FestivalPlaylist) {
  console.log("loaded");

  var festivals = new FestivalPlaylist.Festivals();
  var spotifyProxy = new FestivalPlaylist.SpotifyProxy();
  var bandList;
  
  // Load festivals by default
  festivals.loadNames(function updateFestivals(data){
      var festivalNames = [];
      festivalNames.push('<option value="">Select a festival</option>');

      $.each(data, function(key, val) {
        festivalNames.push('<option value="' + val.id + '">' + val.name + '</option>');
      });
    
     $('#festivalsList').empty().append(festivalNames);
    });


  // Load stages when UI triggered
  $("#festivalsList").change(function() {
    var dataURL = $('#festivalsList option:selected').val();
    festivals.loadStages(dataURL, function(data) {
      var stageItems = [];
      var element;
      $.each(data, function(key, val) {
        element = $('<option value="' + val.id + '">' + val.name + '</option>');
        element.data(val.events);
        stageItems.push(element);
      });
     
     $('#stagesList').empty().append(stageItems);
    });
  });


  // Load bands, and feed into spotify search when UI triggered
  $("#stagesList").change(function() {
    var stagesData = [];
    $.each($("#stagesList option:selected"), function(key, stage) {
      console.log(stage);
      stagesData.push($(stage).val());
    });

    festivals.loadBands(stagesData, function(artists) {
      
      spotifyProxy.startSearch(artists.slice().sort(), function(spotifyBands) {
        spotifyProxy.createPlaylistFromTracks(spotifyBands, function(playlist) {
          console.log("Playlist created:", playlist);
            // bandList is undefined the 1st time around
            if(bandList) {
              spotifyProxy.createGridFromPlaylist(playlist, bandList, function(gridList) {
                bandList = gridList;
              });
            } else {
              spotifyProxy.createGridFromPlaylist(playlist, null, function(gridList) {
                $("#playlistNode").append(gridList.node);
                gridList.init();
                bandList = gridList;
              });
            }
          });
//          spotifyProxy.createSubscribeButtonFromPlaylist(playlist);
      });
    });
  });

});
