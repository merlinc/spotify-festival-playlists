var sp;
var models;
var baseURL = "http://ws.spotify.com/search/1/track.json?q=artist:";
var search;
var standardSearchParameters = {"pageSize":3, "searchArtists":false, "searchTracks": true, "searchAlbums":false};

$(document).ready(function () {

  sp = getSpotifyApi(1);
  models = sp.require('sp://import/scripts/api/models');

  var artistProcessingQueue = [];
  var artistData = [];

  // load data
  $.getJSON('data/festivals.json', function(data) {
    var festivalItems = [];
    festivalItems.push('<option value="">Select a festival</option>');

    $.each(data, function(key, val) {
      festivalItems.push('<option value="' + val.data + '">' + val.festival + '</option>');
    });
   
   $('#festivals').empty().append(festivalItems);
  });

  // choose a festival
  $("#festivals").change(function() {

    dataURL = $('#festivals option:selected').val();

    if(dataURL) {
      $.getJSON('data/' + dataURL, function(data) {
        var stageItems = [];
        var element;
        $.each(data, function(key, val) {
          element = $('<option value="' + val.name + '">' + val.name + '</option>');
          element.data(val.events);
          stageItems.push(element);
        });
       
       $('#stages').empty().append(stageItems);
      });
    }
  });

    // choose stages
  $("#stages").change(function() {
    artistNames = [];
    artistData = [];

    $.each($("#stages option:selected"), function(key, stage) {
      $.each($(stage).data(), function(key, band) {
        artistNames.push(band.name);
      });
    });

    artistNames.sort();
    
    $('#spotify').attr('src', '');

    var artistProcessingQueue = new ProcessingQueue();

    artistProcessingQueue.runQueue(artistNames,
      function(results){
        artistData = results;
        /*
        songIds = [];
        $.each(artistData, function(key, val) {
          songIds.push(val.href.slice(14));
        });
        console.log(songIds.join(','));
        spotifyPlaylistURL = "https://embed.spotify.com/?uri=spotify:trackset:Playlist:"+songIds.join(',');
        $('#spotify').attr('src', spotifyPlaylistURL);
        */
      },
      function(error){
        console.log(error);
    });
  });
});
