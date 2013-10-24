require([
  'scripts/jquery'
], function($Q) {
  'use strict';

  var stageData = {};

  var loadNames = function loadNames(callback){
    $.getJSON('data/festivals.json', function(data) {
      var festivalItems = [];
      $.each(data, function(key, val) {
        festivalItems.push({"id": val.id, "name":val.name});
      });

      callback(festivalItems);
    });
  };

  var loadStages = function loadStages(festival, callback) {

      var dataURL = 'data/' + festival + ".json";
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

  var loadBands = function loadBands(stages, callback) {
      var artistsData = [];

      $.each(stages, function(key, stage) {
        $.each(stageData[stage], function(key, band) {
          artistsData.push(band.name);
        });
      });

      callback(artistsData);
  };


  exports.loadNames = loadNames;
  exports.loadStages = loadStages;
  exports.loadBands = loadBands;
});