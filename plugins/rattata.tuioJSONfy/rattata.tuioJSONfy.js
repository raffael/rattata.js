(function(app){

	var core	= {
	
		/**
		 * loadTuioJSON
		 * Loads the latest version of the tuioJSON files from github using the enableTuioJSON file,
		 * which loads both the TWFixor Filter and the tuioJSON Parser. As soon as both files are loaded,
		 * the WebSocket will be initiated.
		 */
		loadTuioJSON: function(){
			var script		= document.createElement('script');
			script.src		='https://raw.github.com/raffael-me/tuioJSON-Parser/master/enableTuioJSON.tw.git.js';
			script.type		='text/javascript';
			script.async	= true;
			
			/**
			 * append the script
			 */
			document.head.appendChild(script);
		},
		
		/**
		 * enableTuioJSON
		 * Enables Touch responsiveness using the tuioJSON protocol, IF THE SCRIPTS ARE ALREADY INCLUDED
		 * @param	tuioJSONParserOptions		An configuration object for the the tuioJSON Parser object.
		 * @return	-
		 */
		enableTuioJSON: function(tuioJSONParserOptions){
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
	
	app.plugins.define('tuioJSONfy',core);
})(app);