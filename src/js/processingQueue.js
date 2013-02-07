
var ProcessingQueue = function () {

  var searchQueue, searchResults, resultHandler, errorHandler;

  function processQueue() {

    searchingArtist = searchQueue.shift();

    if(searchingArtist) {
        search = new models.Search('artist:"' + searchingArtist + '"', standardSearchParameters);
        search.localResults = models.LOCALSEARCHRESULTS.APPEND;

        search.observe(models.EVENT.CHANGE, function() {
           searchResults.concat(search.tracks.slice(0));

            console.log("--- " + searchingArtist + " ---");

            search.tracks.forEach(function(track) {
                    console.log(track);
                    searchResults.push(track);
                });

            if(searchQueue.length) {
                processQueue();
            }
        });
    }
}


  return {

    // A public function utilizing privates
    runQueue: function( searchNames, result, error ) {

      searchQueue = searchNames;
      resultHandler = result;
      errorHandler = error;
      searchResults = [];

      processQueue();
    }
  };

};