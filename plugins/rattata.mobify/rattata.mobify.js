/**
 * Mobify Plugin for rattata.js
 * 
 * Mobify provides functionality to enhance User Experience on Mobile Devices, especially iOS based devices.
 * 
 */
(function(app){

	var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
	//if(!mobile) return;
	
	var defaults= {
		appIcon: null,
		blackTitleBar: false,
		webAppCapable: true,
		startUpImage: null
	};
	
	var core	= {
		mobilize: function(mobileSettings) {
		
		},
		
		/**
		 * hasRetinaDisplay
		 * Returns true, if the current device has High-Res display (like iPhone 4)
		 * @param	-		-
		 * @return	boolean TRUE or FALSE
		 */
		hasRetinaDisplay: function() {
			return (window.devicePixelRatio >= 2);
		},
		
		/**
		 * isAppleDevice
		 * Returns true if the current device is one of Apple's mobile devices
		 * @param	-		-
		 * @return	boolean TRUE or FALSE
		 */
		isAppleDevice: function() {
			return (/iphone|ipod|ipad/gi).test(navigator.platform);
		},
		
		/**
		 * iOSNewerThan
		 * Returns true, if the iOS version the current device is working on, is higher or equal
		 * to the given version
		 * @param	sdf		The Version (e.g. '4')
		 * @return	boolean TRUE if newer or equal, else FALSE
		 */
		iOSNewerThan: function(majorVersion) {
			if(this.isAppleDevice()) {
				// Check the version
				var pattern = /iPhone OS (.*) like Mac/;
				var result  = navigator.userAgent.match(pattern); // Returns "iPhone OS X_Y like Mac, X_Y"
				var version = result[1].split(''); // Returns X, Y
				var release = version[0];
				return (release >= majorVersion);
			}
			return false;
		},
		
		/**
		 * @experimental
		 * setUpAsHomescreenApp
		 * Adds all required meta tags to enable the app to be beautifully added to the iOS homescreen.
		 * The method also adds a 'standalone' class to the body element, if the app has been started
		 * from the homescreen.
		 * @param	config		A configuration object with fields
		 * 						appIcon:		the source file for the app icon,
		 * 						startUpImage:	the loading image
		 * @return	-	-
		 */
		setUpAsHomescreenApp: function(config) {
			config = $.extend(defaults,config);

			var linksAndMeta	= '';
//			if (config.appIcon) linksAndMeta += '<link rel="apple-touch-icon" href="'+config.appIcon+'" />'
			if (config.appIcon) linksAndMeta += '<link rel="apple-touch-icon-precomposed" href="'+config.appIcon+'" />';

			// doesn't work to be injected via JS:
			//linksAndMeta += '<meta name="apple-mobile-web-app-capable" content="'+config.wepAppCapable+'">';
			//linksAndMeta += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;">';
			//linksAndMeta += '<link rel="apple-touch-startup-image" href="'+config.startUpImage+'" />';
			//if (config.blackTitleBar) linksAndMeta += '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">';

			$('head').append(linksAndMeta);
			
			if (config.startUpImage) {
				if(this.hasRetinaDisplay() && this.iOSNewerThan(5)) { 
					var highResSplash = '<link rel="apple-touch-startup-image" href="resources/images/splashscreen@2x.png" />'; 
					$('head').append(highResSplash); 
				}
			}
			
			if (window.navigator.standalone) $('body').addClass('standalone');
			
			$('body').bind('touchmove', function(e){
				//e.preventDefault();
			});
			
		},
		
		/**
		 * mimicDisabledLandscape
		 * Tries to mimic a disabled landscape by rotating the whole app by 90 degrees if the user rotates the device.
		 * @param	-		-
		 * @return	-
		 */
		mimicDisabledLandscape: function(){
			if (window.orientation==undefined) return;
			$(document).ready(function () {
			  function reorient(e) {
			    var portrait = (window.orientation % 180 == 0);
			    $("body > div").css("-webkit-transform", !portrait ? "rotate(-90deg)" : "");
			  }
			  window.onorientationchange = reorient;
			  window.setTimeout(reorient, 0);
			});
		},
		
		/**
		 * mimicFullscreen
		 * Tries to mimic fullscreen (e.g., hiding the Mobile Safari toolbar) by scrolling down by 1px-
		 * @param	-		-
		 * @return	-
		 */
		mimicFullscreen: function() {
			if (!window.navigator.standalone) setTimeout(function() { window.scrollTo(0, 1); }, 1);
		},
		
		/**
		 * disableTouchCallout
		 * Disables the touchcallout on Mobile Safari, which is triggered if the user tap and holds an
		 * element of the DOM.
		 * @param	optionalSelector		An optional selector on which the callout shall be disabled on. 'a' instead.
		 * @return	-
		 */
		disableTouchCallout: function(optionalSelector){
			$((optionalSelector) ? optionalSelector : 'a').css('-webkit-touch-callout','none');
		},
		
		/**
		 * interpretTouchAsClick
		 * Triggers a click event on elements as soon as the user touches it.
		 * @param	optionalSelector		An optional selector for the element
		 * @return	-
		 */
		interpretTouchAsClick: function(optionalSelector) {
			$((optionalSelector) ? optionalSelector : 'a').bind('touchstart',function(){
				$(this).trigger('click');
			});
		},
		
		/**
		 * enableRetinaGraphics
		 * Replaces all source files of img tags with the class 'retinaImage'/'retinaBackground'
		 * with a High-Res version of the image. Do do that, the image size must be known. If the
		 * developer has not specified the image dimension via the width/height attributes, the images
		 * first is loaded completely to determine the image size.
		 * 
		 * @param	optionalSuffix		The suffix for the High-Res Images, '@2x' by default.
		 * @return	-
		 */
		enableRetinaGraphics: function(optionalSuffix) {
			if (!optionalSuffix) optionalSuffix = '@2x';
			
			// add a 'retinaImage' class to <img> tags and 'retinaBackground' to elements
			// in order to to reload their source
			// make sure you add the width="xxx" attribute to the image, otherwise
			// the width will be calculated based on the width of the image
			// which can only be determined as soon as the low dpi image has been loaded
			$('.retinaImage').each(function(){
				var width =  $(this).attr('width');
				
				if (width!=null && width!='') {
					var src = $(this).attr('src');
					src = src.replace('.png', suffix+'.png');
					src = src.replace('.gif', suffix+'.gif');
					src = src.replace('.jpg', suffix+'.jpg');
					$(this).attr('src', src );
				} else {
					$(this).load(function(){
						var width = $(this).width();
						var src = $(this).attr('src');
						src = src.replace('.png', suffix+'.png');
						src = src.replace('.gif', suffix+'.gif');
						src = src.replace('.jpg', suffix+'.jpg');
						$(this).attr('src', src ).attr('width',width);
					});
				}
				
			});
			
			
			$('.retinaBackground').each(function(){
				var src = $(this).css('background-image');
				src = src.replace('.png', suffix+'.png');
				src = src.replace('.gif', suffix+'.gif');
				src = src.replace('.jpg', suffix+'.jpg');
				var size = '50% 50%';
				$(this).css({
					backgroundImage: src,
					backgroundSize: size
				});
			});
			
		}
	};
	
	app.plugins.define('mobify',core);
	
})(app);