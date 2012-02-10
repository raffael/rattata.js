(function(app){

	var core	= {
	
		/**
		 * check if browser fullscreen mode is available in the browser
		 * @return	BOOLEAN		TRUE, if fullscreen mode is available, else FALSE
		 */
		vendorPrefix: '',
		fullScreenIsAvailable: function(){
			this.vendorPrefix = app.utils.getBrowserVendor();

			var vendorSupported = (typeof document[this.vendorPrefix+'CancelFullScreen'] != 'undefined');
			var nativeSupported	= (typeof document['cancelFullScreen'] != 'undefined');
			if (!vendorSupported && !nativeSupported) {
				this.vendorPrefix = null;
				return false;
			} else {
				return true;
			}
		},
		
		/**
		 * request to enable browser fullscreen mode (only available in modern browsers)
		 * @return BOOLEAN		TRUE, if request could be sent, else FALSE
		 */
		_currentlyIsInFullScreen: false,
		isInFullScreen: function(){
			return this._currentlyIsInFullScreen;
		},
		
		enableFullScreen: function(){
			if (!this.fullScreenIsAvailable()) return false;
			else {
				if (this._currentlyIsInFullScreen) return false;
				var func = (this.vendorPrefix=='') ? 'requestFullScreen' : this.vendorPrefix+'RequestFullScreen';
				document.getElementById('app')[func]();
				this._currentlyIsInFullScreen = true;
			}
		},
		
		/**
		 * request to disable the fullscreen mode
		 * @return BOOLEAN		TRUE, if request could be sent, else FALSE
		 */
		disableFullScreen: function(){
			if (!this.fullScreenIsAvailable) return false;
			else {
				var func = (this.vendorPrefix=='') ? 'cancelFullScreen' : this.vendorPrefix+'cancelFullScreen';
				document[func]();
				alert('disable');
				this._currentlyIsInFullScreen = false;
			}
		},
				
		/**
		 * define a callback to handle the event if the user switches the browser to the top most window
		 * @param	function	handler
 		 */
		onEnteringTopMostWindow: function(callback){
			$(window).focus(callback);
		},
		
		/**
		 * define a callback to handle the event if the user uses a different window as the top most window
		 * @param	function	handler
		 */		
		onLeavingTopMostWindow: function(callback){
			$(window).blur(callback);
		},
		
		/**
		 * get width if browser window canvas
		 * @return INT			width in pixels
		 */
		width: function(){
			return window.screen.width;
		},
		
		/**
		 * get height of browser window canvas
		 * @return INT			height in pixels
		 */
		height: function(){
			return window.screen.height;
		},
		
		/**
		 * get x position of browser window canvas
		 * @return INT			distance in pixels from left screen edge to canvas
		 */
		 x: function(){
		 	return (window.screenLeft==undefined) ? window.screenX : window.screenLeft;
		 },
		
		/**
		 * get y position of browser window canvas
		 * @return INT			distance in pixels from upper screen edge to canvas
		 */
		y: function(){
		 	return (window.screenTop==undefined) ? window.screenY : window.screenTop;
		},
		
		/**
		 * check if HTML DOM is embedded in an iframe
		 * @return	BOOLEAN		TRUE, if document is embedded, else FALSE
		 */
		isEmbedded: function(){
			return (window.location != window.parent.location);
		}
		
	};
	
	app.plugins.define('appify',core);
	
})(app);