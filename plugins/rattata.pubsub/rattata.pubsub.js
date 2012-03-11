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
	var pubsubReceiverId	= 'rattata-pub-sub-receiver';
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
		},
		
		/**
		 * subscribe
		 * Manually subscribe to a global event. You'd better use the syntax explained in
		 * the docs above.
		 * 
		 * @param	eventName		The name of the event you want to subscribe
		 * @return	-
		 */
		subscribe: function(eventName, handler) {
			this.eventReceiver.bind(eventName, handler);
		},
		
		/**
		 * subscribeOnce
		 * Manually subscribe to a global event. You'd better use the syntax explained in
		 * the docs above.
		 * As soon as the subscribed event is fired, the subscription will be removed.
		 * 
		 * @param	eventName		The name of the event you want to subscribe
		 * @return	-
		 */
		subscribeOnce: function(eventName, handler) {
			var self = this;
			this.eventReceiver.bind(eventName, function(event,data){
				handler(event,data);
				self.eventReceiver.unbind(eventName);
			});
		}
	};
	
	$('<i style="visibility:hidden;" id="'+pubsubReceiverId+'" class="'+app.uiBindingPrefix.replace('.','')+'Global"></i>').appendTo($('body'));
	core.eventReceiver	= $('#'+pubsubReceiverId);
	
	app.plugins.define('pubsub',core);
	
})(app);