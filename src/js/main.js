function initPage() {

    // disable dragging of images
    $('img').bind('dragstart', function(event) { event.preventDefault(); });


  // load data
  $.getJSON('data/festivals.json', function(data) {
    var festivalItems = [];
    festivalItems.push('<option value="">Select a festival</option>');

    $.each(data, function(key, val) {
      festivalItems.push('<option value="' + val.data + '">' + val.festival + '</option>');
    });
   
   $('#festivalsList').empty().append(festivalItems);
  });


      // choose a festival
  $("#festivalsList").change(function() {

    dataURL = $('#festivalsList option:selected').val();

    if(dataURL) {
      $.getJSON('data/' + dataURL, function(data) {
        var stageItems = [];
        var element;
        $.each(data, function(key, val) {
          element = $('<option value="' + val.name + '">' + val.name + '</option>');
          element.data(val.events);
          stageItems.push(element);
        });
       
       $('#stagesList').empty().append(stageItems);
      });
    }
  });

    // choose stages
  $("#stagesList").change(function() {
    var artistsData = [];

    $.each($("#stagesList option:selected"), function(key, stage) {
      $.each($(stage).data(), function(key, band) {
        artistsData.push(band.name);
      });
    });

    artistsData.sort();

    console.log(artistsData);

    SpotifyProxy.startSearch(artistsData);
    });

    $('#addPlaylist').click(function() {
      var playlistName = $("#festivalsList option:selected").text();
      var stageNames = [];
      $.each($("#stagesList option:selected"), function(key, stage) {
        console.log(stage);
        stageNames.push(stage.text);
      });
      if(stageNames.length >1) {
        playlistName += " (" + stageNames.slice(0, -1).join(", ");
        playlistName += " & " + stageNames.slice(-1) + ")";
      } else
      {
        playlistName += " (" + stageNames[0] + ")";
      }

      SpotifyProxy.savePlaylist(playlistName);
    });
}

$(document).ready( initPage() );