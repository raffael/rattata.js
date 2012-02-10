(function(app){

	var core	= {
	
		/**
		 * enableTuioJSON
		 * Enables Touch responsiveness using the tuioJSON protocol.
		 * @param	tuioJSONParserOptions		An configuration object for the the tuioJSON Parser object.
		 * @return	-
		 */
		function enableTuioJSON(tuioJSONParserOptions){
			var fixor	= new TWFixor({
				tuioJSONParser:	new tuioJSONParser(tuioJSONParserOptions)
			});
			
			// initialize a WebSocket Object
			socket = new WebSocket('ws://127.0.0.1:8787/jWebSocket/jWebSocket');
			
			// define Callback handler for opOpen event
			socket.onopen = function(){
				var registerMessage = '{"ns":"de.dfki.touchandwrite.streaming","type":"register","stream":"touchandwriteevents"}';
				socket.send(registerMessage);
			}
			
			socket.onerror	= function(){
				throw "Something went wrong while connecting to WebSocket.";
			}
			
			// define Callback handler for onMessage event
			socket.onmessage = function(msg){
				// extract JSON data from message
				var data = JSON.parse(msg.data);
				// and pass it to the TuioJSON parser
				fixor.fix(data);
			}
		}
	};
	
	app.plugins.define('tuiojSONfy',core);
})(app);