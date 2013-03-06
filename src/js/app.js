// Start the main app logic.
require(['$api/models', 'js/FestivalPlaylist'],
function   ($models, FestivalPlaylist) {
  console.log("loaded");

  var festivals = new FestivalPlaylist.Festivals();
  var spotifyProxy = new FestivalPlaylist.SpotifyProxy();
  var bandList;
  
  // Load festivals by default
  festivals.loadNames(function updateFestivals(data){
      
      $('#festivalsList').empty();

      $.each(data, function(key, val) {
        $('#festivalsList').append('<li><label><input type="radio" name="festivalRadio" value="' + val.id + '"/>' + val.name + '</label></li>').fadeIn();
      });
    });


  // Load stages when UI triggered
  $("#festivalsList").change(function() {
    var dataURL = $('#festivalsList input:radio:checked').val();
    festivals.loadStages(dataURL, function(data) {
      $('#stagesList').empty();

      $.each(data, function(key, val) {
        $('#stagesList').append('<li><label><input type="checkbox" name="stageRadio" value="' + val.id + '"/>' + val.name + '</label></li>').fadeIn();
      });
    });
  });


  // Load bands, and feed into spotify search when UI triggered
  $("#stagesList").change(function() {
    var stagesData = [];
    $.each($("#stagesList input:checkbox:checked"), function(key, stage) {
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
