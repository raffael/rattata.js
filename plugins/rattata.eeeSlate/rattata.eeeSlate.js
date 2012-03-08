(function(app){

	
	/**
	 * This plugin provides special functionality to handle the Asus EEE Slate as runtime device.
	 * The plugin re-calibrates the origin of the tuioJSON coordinate system based on whether the
	 * user is using fullscreen mode (native webkit fullscreen mode, not the F11 fullscreen mode!)
	 * or windowed mode (Safari, with hidden menu bar at the top!)
	 */
	$(document).ready(function(){
		
		document.addEventListener('tuiojsonready', function() {
			function recalibrateForEEESlate() {
				var coords;
				if (app.appify.isInFullScreen()) {
					console.log("Calibrating tuioJSON coordinates for full screen mode");
					coords = { x: 70, y: -35 }
				} else {
					console.log("Calibrating tuioJSON coordinates for windowed mode");
					coords = { x: 65, y: 30 }
				}
				parserProxy.getParser().setOptions({
					useCoordinateCalibration: true,
					coordinateOrigin: coords
				});
			}
			
			recalibrateForEEESlate();
			document.documentElement.addEventListener('fullscreeneventchange', recalibrateForEEESlate, true);			
			
			
		}, true);
	});
	
})(app);