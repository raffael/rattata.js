(function(app){

	var core	= {
	
		loadTuioJSON: function(){
			var tuioParserComplete	= false,
				twFixorComplete		= false;
			
			
			/**
			 * as soon as both scripts have been loaded, create the parser and the WebSocket connection
			 */
			function injectingTuioComplete(){
				if (tuioParserComplete && twFixorComplete) {
					window.parserProxy	= new TWFixor({
						tuioJSONParser:	new tuioJSONParser({
							// parsing options
						})
					});
					
					// initialize a WebSocket Object
					socket = new WebSocket('ws://127.0.0.1:8787/jWebSocket/jWebSocket');
					
					// define Callback handler for opOpen event
					socket.onopen = function(){
						var registerMessage = '{"ns":"de.dfki.touchandwrite.streaming","type":"register","stream":"touchandwriteevents"}';
						socket.send(registerMessage);
						console.log("tuioJSON is ready");
					}
					
					// define Callback handler for onMessage event
					socket.onmessage = function(msg){
						// extract JSON data from message
						var data = JSON.parse(msg.data);
						// and pass it to the TuioJSON parser
						window.parserProxy.fix(data);
					}
				}
			}
			
			/**
			 * prepare script injecting and define onload event handlers
			 */
			var scriptTuioParser	= document.createElement('script');
			scriptTuioParser.src	='https://raw.github.com/raffael-me/tuioJSON-Parser/master/lib/tuioJSONParser.js';
			scriptTuioParser.type	='text/javascript';
			scriptTuioParser.async	= true;
			scriptTuioParser.onload	= function(){
				tuioParserComplete	= true;
				injectingTuioComplete();
			}
			
			var scriptTWFixor		= document.createElement('script');
			scriptTWFixor.src		='https://raw.github.com/raffael-me/tuioJSON-Parser/master/TWFixor.j';
			scriptTWFixor.type		='text/javascript';
			scriptTWFixor.async		= true;
			scriptTWFixor.onload	= function(){
				twFixorComplete		= true;
				injectingTuioComplete();
			}
			
			/**
			 * append the two scripts
			 */
			document.head.appendChild(scriptTuioParser);
			document.head.appendChild(scriptTWFixor);
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