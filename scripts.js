// Connect to control server
var ws = new WebSocket("ws://doorjam.redpepperlab.com:8080");
ws.on('message', function(trackId, flags) {
  if (trackId) {
    playTrack(trackId);
  }
});

// Make an iBeacon
var uuid = 'e2c56db5dffb48d2b060d0f5a71096'
var major = '0';
var minor = '0';
var measuredPower = -59;
bleno.startAdvertisingIBeacon(uuid, major, minor, measuredPower);

// Listen for Bits Please iBeacon
var uuid = 'e2c56db5dffb48d2b060d0f5a71096';
var identifier = 'Bits Please';
var minor = 0;
var major = 0;
var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
var delegate = new cordova.plugins.locationManager.Delegate();
delegate.didRangeBeaconsInRegion = function (pluginResult) {
  var beacons = pluginResult.beacons;
  beacons.forEach(function(beacon) {
    if(beacon.rssi > -65 && beacon.rssi < 0) {
      $.get("http://doorjam.redpepperlab.com/play", { trackId: localStorage.trackId });
    }
  })
};
cordova.plugins.locationManager.setDelegate(delegate);
cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
 .fail(console.error)
 .done();

 // Get theme song preview mp3 from Spotify API
var trackId = '0FutrWIUM5Mg3434asiwkp';
var spotifyApi = new SpotifyWebApi({
  clientId : 'XXXXXX',
  clientSecret : 'XXXXXX',
  redirectUri : 'http://192.168.1.92:3000'
});
spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    spotifyApi.setAccessToken(data['access_token']);
  }, function(err) {
    console.log(err);
});
spotifyApi.getTrack(trackId)
  .then(function(data) {
    if (data.body.preview_url == null) {
      console.log('Preview url empty');
    } else {
      var audioFile = data.body.preview_url;
      audioFile = audioFile.replace('https://', 'http://');
      child_process.execFile('mplayer', [audioFile], 
        function(error,  stdout, stderr){
          console.log(stdout);
      });
    }
  }, function(err) {
    console.error(err);
});