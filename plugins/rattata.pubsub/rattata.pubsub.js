/**
 * The pubsub plugin provides simple global message transmitting by triggering
 * custom events on a global event receiver DOM object, which will be added to
 * the DOM while initializing the plugin.
 * Using the publish() method, the developer can trigger global events that the
 * controllers can react on:
 * 
 * 		// trigger the following custom event anywhere
 * 		app.pubsub.publish('userIsNotLoggedIn',{ since: 12333939 });
 * 
 * 
 * 		// react on the event in any active controller:
 * 
 * 		(...)
 * 		'notLoggedIn global': function(event, eventData) {
 * 			// event handler
 * 		}
 * 
 * 		(Notice the syntax of the event handling:
 * 		'CUSTOM_EVENT_NAME global'
 * 
 */
(function(app){

	var core	= {
		
		eventReceiver: null,
		
		/**
		 * publish
		 * Publishes a custom event on the global eventReceiver DOM element.
		 * @param	eventName		The name of the custom event
		 * @param	data			Optional data to specify the event
		 * @return	-
		 */
		publish: function(eventName, data) {
			this.eventReceiver.trigger(eventName, data);
		}
	};
	
	$('<i style="visibility:hidden;" id="rattata-pubsub-receiver" class="'+app.uiBindingPrefix.replace('.','')+'Global"></i>').appendTo($('body'));
	core.eventReceiver	= $('#rattata-pubsub-receiver');
	
	app.plugins.define('pubsub',core);
	
})(app);