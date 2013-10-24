require([
  '$api/models',
  'scripts/language',
  'scripts/spotifyFacade',
  'scripts/data'
], function(models, language, spotifyFacade, data) {
  'use strict';

  language.applyLanguages();

  $(document).ready(function() {

    // Search selectors
    $('.filterBox input[type="search"]').on('search', function() {
        $('#festivalsList li').show();
    });

    $('.filterBox input[type="search"]').keyup(function(event) {

      var searchString = event.target.value.toLowerCase();//+String.fromCharCode(event.which);

      if(searchString && searchString.length) {
        $('#festivalsList li').filter(function(index) {
          return -1 !== this.innerText.toLowerCase().indexOf(searchString);
        }).show();

        $('#festivalsList li').filter(function(index) {
            return -1 === this.innerText.toLowerCase().indexOf(searchString);
        }).hide();
      // If no search string - show everything
      } else {
        $('#festivalsList li').show();
      }

    });

    // Load stages when UI triggered
    $(".festivals .actionBox button.load").click(function() {

      var selectedItem = $('#festivalsList input:radio:checked');

      var label = $(selectedItem).parent().children('label').text();
      var dataURL = selectedItem.val();

      $('.festivals h3').text(label);

  //    $('#festivalsList').hide();

      data.loadStages(dataURL, updateStages);
    });


    $(".stages .filterBox button.filter-all").click(function() {
      $('#stagesList input:checkbox').prop('checked', true);
    });
    $(".stages .filterBox button.filter-none").click(function() {
      $('#stagesList input:checkbox').prop('checked', false);
    });


    // Load bands, and feed into spotify search when UI triggered
    $(".stages .actionBox button.load").click(function() {
      var stagesData = $.map( $("#stagesList input:checkbox:checked"), function (element) { return $(element).val(); });

      data.loadBands(stagesData, function(artists) {
          spotifyFacade.startSearch(artists.slice().sort(), function(spotifyBands) {
            spotifyFacade.updatePlayListWithTracks(spotifyBands)
              .done(function(playlist) {
                spotifyFacade.refreshViewListWithPlaylist(playlist);
              })
              .fail(function(error) { console.log(error);});
        });
      });
    });
  });

  var updateFestivals = function updateFestivals(data){
    $('#festivalsList').empty();

      $.each(data, function(key, val) {
        $('#festivalsList').append('<li><input type="radio" id="' + val.id + '" name="festivalRadio" value="' + val.id + '"></input><label for="' + val.id + '"><span/>' + val.name + '</label></li>').fadeIn();
      });
  };

  var updateStages = function updateStages(data) {
    $('#stagesList').empty();
    //spotifyProxy.getEmptyPlaylist();

    $.each(data, function(key, val) {
      $('#stagesList').append('<li><input type="checkbox" id="' + val.id + '"name="stageRadio" value="' + val.id + '"></input><label for="' + val.id + '"><span/>' + val.name + '</label></li>').fadeIn();
    });
  };

  
  // Load festivals by default
  data.loadNames(updateFestivals);

});
