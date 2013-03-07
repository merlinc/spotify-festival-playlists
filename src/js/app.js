// Start the main app logic.
require(['$api/models', 'js/FestivalPlaylist'],
function   ($models, FestivalPlaylist) {

  var dataProxy = new FestivalPlaylist.DataProxy();
  var spotifyProxy = new FestivalPlaylist.SpotifyProxy();
  var bandList;
  
  // Load festivals by default
  dataProxy.loadNames(function updateFestivals(data){
      
      $('#festivalsList').empty();

      $.each(data, function(key, val) {
        $('#festivalsList').append('<li><input type="radio" id="' + val.id + '" name="festivalRadio" value="' + val.id + '"></input><label for="' + val.id + '"><span/>' + val.name + '</label></li>').fadeIn();
      });
    });


  // Load stages when UI triggered
  $("#festivalsList").change(function() {
    var dataURL = $('#festivalsList input:radio:checked').val();
    dataProxy.loadStages(dataURL, function(data) {
      $('#stagesList').empty();

      $.each(data, function(key, val) {
        $('#stagesList').append('<li><input type="checkbox" id="' + val.id + '"name="stageRadio" value="' + val.id + '"></input><label for="' + val.id + '"><span/>' + val.name + '</label></li>').fadeIn();
      });
    });
  });


  // Load bands, and feed into spotify search when UI triggered
  $("#stagesList").change(function() {
    var stagesData = $.map( $("#stagesList input:checkbox:checked"), function (element) { return $(element).val(); });

    dataProxy.loadBands(stagesData, function(artists) {
      
      spotifyProxy.startSearch(artists.slice().sort(), function(spotifyBands) {
        spotifyProxy.createPlaylistFromTracks(spotifyBands, function(playlist) {
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

            spotifyProxy.createSubscribeButtonFromPlaylist(playlist, function(button) {
              $(button.node).click(function() {
                var festivalName = $('#festivalsList input:radio:checked + label').text();

                var stageNames = $.map( $("#stagesList input:checkbox:checked + label"), function (element) { return $(element).text(); });
                var playlistName = "Festival Playlists - " + festivalName + " (" + stageNames.join(", ") + ")";
                var playlistDescription = 'Festival Playlists - generated playlist for ' + festivalName + ' (' + stageNames.join(', ') + ')';

                spotifyProxy.subscribeToPlaylist(playlist, playlistName, playlistDescription);
              });

            $("#playlistButton").empty().prepend(button.node);
            });
          });
//          spotifyProxy.createSubscribeButtonFromPlaylist(playlist);
      });
    });
  });

});
