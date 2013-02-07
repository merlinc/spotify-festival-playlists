function timeFormat(duration) {
    var seconds = duration / 1000;
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % (60);

    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}