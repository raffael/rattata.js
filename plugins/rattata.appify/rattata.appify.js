/**
 * From:	John Dyer's Code
 * URL:		http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
 */
(function() {
    var
        fullScreenApi = {
            supportsFullScreen: false,
            isFullScreen: function() { return false; },
            requestFullScreen: function() {},
            cancelFullScreen: function() {},
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' ');
 
    // check for native support
    if (typeof document.cancelFullScreen != 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
            fullScreenApi.prefix = browserPrefixes[i];
 
            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                fullScreenApi.supportsFullScreen = true;
 
                break;
            }
        }
    }
 
    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
 
        fullScreenApi.isFullScreen = function() {
            switch (this.prefix) {
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        }
        fullScreenApi.requestFullScreen = function(el) {
            return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
        }
        fullScreenApi.cancelFullScreen = function(el) {
            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
        }
    }
 
    // jQuery plugin
    if (typeof jQuery != 'undefined') {
        jQuery.fn.requestFullScreen = function() {
 
            return this.each(function() {
                if (fullScreenApi.supportsFullScreen) {
                    fullScreenApi.requestFullScreen(this);
                }
            });
        };
    }
 
    // export api
    window.fullScreenApi = fullScreenApi;
})();



(function(app){  
	var core	= {
	
		/**
		 * check if browser fullscreen mode is available in the browser
		 * @return	BOOLEAN		TRUE, if fullscreen mode is available, else FALSE
		 */
		vendorPrefix: '',
		fullScreenIsAvailable: function(){
			return fullScreenApi.supportsFullScreen;
		},
		
		/**
		 * request to enable browser fullscreen mode (only available in modern browsers)
		 * @return BOOLEAN		TRUE, if request could be sent, else FALSE
		 */
		isInFullScreen: function(){
			fullScreenApi.isFullScreen();
		},
		
		enableFullScreen: function(){
			fullScreenApi.requestFullScreen(document.documentElement);
		},
		
		/**
		 * request to disable the fullscreen mode
		 * @return BOOLEAN		TRUE, if request could be sent, else FALSE
		 */
		disableFullScreen: function(){
			fullScreenApi.cancelFullScreen(document.documentElement);
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