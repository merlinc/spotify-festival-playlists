requirejs.config({
    shim: {
        'ui': {
            deps: ['spotifyDesktop', 'jquery'],
            exports: 'ui'
        },
        'spotifyDesktop': {
            deps: ['jquery'],
            exports: 'SpotifyDesktop'
        }
    }
});

// Start the main app logic.
requirejs(['jquery', 'ui', 'spotifyDesktop'],
function   ($,        ui,   spotifyDesktop) {
  console.log("loaded");
});