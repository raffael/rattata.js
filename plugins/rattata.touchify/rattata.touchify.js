/**
 * Touchify Plugin for rattata.js
 * 
 * Touchify provides methods to enhance User Experience on touch enabled devices.
 * 
 */

(function(app){

	var defaults= {
		appIcon: null,
		blackTitleBar: false,
		webAppCapable: true,
		startUpImage: null,
		touchReceiverSelector:	'a, div, button',		// which elements shall get the touchActiveclass on touchstart event?
		touchActiveClass:		'touchActive'			// what CSS class shall touched elements get on touchstart event?
	};
	
	function extendMethod(obj,name,additionalFunctionality){
		var ref = obj[name],
			args= arguments;
		obj[name] = function(){
			ref(obj);
			additionalFunctionality();
		}
	}
	
	var core	= {
		touchify: function(options) {
		
			options	= $.extend(defaults, options);
			
			/**
			 * overwrite the rebindUi method of all controllers to additionally add a 'touchActive' class
			 * to those elements that are currently pressed using 'touchstart'.
			 */
			for(var c in app.controllers) {
				if (app.controllers[c] && typeof app.controllers[c]=='object' && app.controllers[c].hasOwnProperty('name')) {
					var object				= app.controllers[c];
					extendMethod(object, 'rebindUi', function(){
						$(options.touchReceiverSelector).bind('touchstart',function(){
							$(this).addClass(options.touchActiveClass);
						}).bind('touchend',function(){
							$(this).removeClass(options.touchActiveClass);						
						});
					});
				}
			}
		}
	};
	
	app.plugins.define('touchify',core);
	
})(app);