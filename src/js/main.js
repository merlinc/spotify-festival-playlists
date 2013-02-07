
var searchingFestival;
var festivalData;
var foundTracks = [];

function initPage() {
//                $('.flexigrid').flexigrid();

    initSpotify();

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
    artistsData = [];

    $.each($("#stages option:selected"), function(key, stage) {
      $.each($(stage).data(), function(key, band) {
        artistsData.push(band.name);
      });
    });

    artistsData.sort();

    console.log(artistsData);

    // Wrong place!
    $('#playlistDisplay > tbody').empty();
    foundTracks = [];

    runSearch();
    });

    $('#savePlaylist').click(function() {savePlaylist();});
    $('#playPlaylist').click(function() {addSongsToPlayQueue();});
}

$(document).ready( initPage() );