var sp;
var models;
var search;
var standardSearchParameters = {"pageSize":3, "searchArtists":false, "searchTracks": true, "searchAlbums":false};

var searchingFestival;

var artistsData;
var festivalData;
var foundTracks = [];

function timeFormat(duration) {
    var seconds = duration / 1000;
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % (60);

    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}


function runSearch() {

    searchingArtist = artistsData.shift();

    if(searchingArtist) {
        search = new models.Search('artist:"' + searchingArtist + '"', standardSearchParameters);
        search.localResults = models.LOCALSEARCHRESULTS.APPEND;
   
        var searchHTML = document.getElementById('search');

        search.observe(models.EVENT.CHANGE, function() {
           foundTracks.concat(search.tracks.slice(0));

            console.log("--- " + searchingArtist + " ---");
            $('#playlistDisplay > tbody:last').append('<tr scope="row" class="spec"><th colspan="2">' + searchingArtist + '</th></tr>');

            search.tracks.forEach(function(track) {
                    console.log(track);
                    $('#playlistDisplay > tbody:last').append('<tr><td>' + track.name + '</td><td>' + timeFormat(track.duration) + '</td></tr>');
                    foundTracks.push(track);
                });

            if(artistsData.length) {
                runSearch();
            }

        });

        search.appendNext();
    }
}

function startSearch(festivalId) {

    foundTracks = [];
    festivalData = festivalId;

    $.getJSON('sp://festival-generator/data/'+festivalId+'.json', function(data) {
        artistsData = data;
        runSearch();
    });

}

function generatePlaylist() {
    console.log(foundTracks);

    var newFestivalPlaylist = new models.Playlist("FG - Top 3 Songs");
    $.each(foundTracks, function(index, value) { newFestivalPlaylist.add(value);});
}



function displayResults() {
    for(i=0;i<foundTracks.length;i++){
        var link = document.createElement('li');
        var a = document.createElement('a');
        a.href = foundTracks[i].uri;
        link.appendChild(a);
        a.innerHTML = '<b>' + foundTracks[i].name + '</b> <i>' + foundTracks[i].duration + '</i>';
        searchHTML.appendChild(link);
    }         
}

function initPage() {
    /* Instantiate the global sp object; include models & views */
    sp = getSpotifyApi(1);
    models = sp.require('sp://import/scripts/api/models');

//    $('#generatePlaylist').change(function() { startSearch });

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

    runSearch();
    });

    $('#generatePlaylist').click(function() {generatePlaylist();});

//$("#target").click(function() {
 // alert("Handler for .click() called.");
//});

}
$(document).ready( initPage() );