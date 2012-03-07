// Rattata.js
// This is a lightweight MVC architecture for JavaScript.
// raffael@raffael.me

"use strict";

/**
 * Let's check if steal is part of the scene
 */
if (typeof steal == 'undefined') WARNING('Rattata.js requires StealJS. Please include it in your code!');

/**
 * The 'app' variable stores the whole MVC app you're building.
 * In the following structure, some basic attributes are initialized with their default
 * values. You can overwrite them using the app.build(options) method.
 * Private methods of the structure you should not touch begin with an underscore.
 */
var app = {

	/**
	 * What's the version name of this app?
	 */
	version:	'',
	
	/**
	 * What's the delimiter in the template engine?
	 * (Say tD is your templateDelimiter. Variables in the templates will be rendered
	 * into tags like <tD= VAR tD>)
	 */
	templateDelimiter: '*',
	
	/**
	 * What prefix are you using to define UI interaction logic elements in your views?
	 * (If you define a 'click sayHello' binding in your controller, there has to be an
	 * element that matches the query [uiBindingprefix]SayHello. Use dots or hash to
	 * for classes of ids)
	 */
	uiBindingPrefix: '.ui',
	
	/**
	 * The element where to embed rendered view content into by default.
	 * Use into() to use a different element.
	 */
	skeleton: '#app',
	
	/**
	 * What predefined routing rules do you define?
	 * (You can define a rule that links to a specific controller like
	 * '/tasks/show/single/{taskId}/detailed/{detailed}': 'tasks')
	 */
	routing: {},
	
	/**
	 * What protocol are you using?
	 * (Will be determined by the app automatically)
	 */
	protocol: '',
	
	/**
	 * Will be appended to every AJAX call URL. This is handy if you have
	 * to provide some kind of access token while communicating with the
	 * server.
	 */
	modelUrlSuffix: '',
	
	/**
	 * Do you to enable browser history?
	 */
	enableBrowserHistory: false,
	
	/**
	 * What data type are you communicating with?
	 */
	communicationType: 'json',
	jsonpCallback: '',
	
	/**
	 * What do you want your app to do on server communication error?
	 */
	defaultCommunicationErrorHandler: function(jqXHR, textStatus, errorThrown){
		WARNING("Error while communicating with server ["+jqXHR.status+" "+textStatus+": "+errorThrown+". Server responded with '"+jqXHR.responseText+"']");
	},
	
	/**
	 * How do you want your data to be serialized when transmitted to the server?
	 */
	serializeData: function(HTTPtype, dataObject) {
		return $.param(dataObject,false);
	},
	
	/**
	 * executes the app by determining the right controller: if a route hash has been
	 * specified in the window.location, try to load that controller based on app.routing,
	 * otherwise try to launch that controller with a main()
	 * (you can start individual controllers using app.controllers.yourController.run())
	 */
	_run: function() {
		var location = window.location.hash.substr(1),
			match;
		if (location!='') match = app._routeMatching(location);
		if (match!=null) match.controller.activate(match.parameters);
		else {
			if (this.controllers.main==null) WARNING("Route matching did not succeed and no controller has specified to be the default controller");
			else {
				LOG("starting app using default controller '"+this.controllers.main.name+"'");
				app.controllers.current = this.controllers.main;
				app.controllers.current.run();
			}
		}
	},
	
	/* Simple Models
	 * Simple Models provide a streamlined way to communicate with a backend or a local file via AJAX requests.
	 * To build a model, the developer simply provides an object that contains model method names and URL
	 * that will be called via AJAX. The URL definition can be simple (URL only) or more complex (i.e., it includes
	 * HTTP type, error handler, processor after successful data transfer.
	 * 	The model can be specified in a simple and in two more complex ways:
	 * the simple way is to define a model method like this:
	 * 		get: 'http://api.domain/info/object/{objectId}',
	 * so that the developer can execute model.get({objectId: 123}, callbackFunction);
	 * 	The more complex way is to specify HttpType, Url and processingCallback as array with two elements
	 * where default type is GET if no prefix is given:
	 * 		get: ['GET http://api.domain/info/object/{objectId}',function(result){result.additionalInfo=123;}];
	 * The processingCallback will be called before the AJAX callback will be called so that
	 * the developer can make data enrichments etc. to the AJAX result.
	 * 	The most complex way is to define an object that contains the values 'type', 'url', 'processor' and 'error',
	 * where processor and error and functions to enrich data resp. handle errors
	 */
	models:		{
		/**
		 * call app.models.define(name, {...}) in an external file to create a new model
		 */
		define: function(name,core){
			
			/**
			 * check if name is new
			 */
			if (this[name]!=null) {
				WARNING("Duplicate model definition found for '"+name+"'");
				return false;
			}
			
			LOG("attempting to make new model called '"+name+"'");
			
			var keys	= Object.keys(core),
				i		= 0,
				newModel= $.extend(core, {
					error:		function(jqXHR, textStatus, errorThrown) {
						WARNING('Error while fetching model from URL');
					}
				});
			
			for(i=0;i<keys.length;i++) (function(i) {
				/**
				 * ignore custom model functions the developer has written
				 */
				if (typeof core[keys[i]] == 'function') return;
				
				/*
				 * parse the model definition which can be defined in four different ways
				 */
				var methodName		= keys[i],
					that			= this,
					modelDefinition = app._parseModelDefinition(core[keys[i]]);
				
				/**
				 * developer handler is the callback function
				 */
				newModel[methodName]	= function(parameters,developerHandler){
					
					/**
					 * if the model method does not require any parameters, the developer can
					 * pass the developerHandler as the first parameter of method, instead of
					 * passing an empty object ({}, ...)
					 * So check, 
					 * wether 'parameters' is a function and developerHandler is undefined
					 */
					if (typeof parameters == 'function' && developerHandler==undefined) {
						developerHandler= parameters;
						parameters		= {};
					}
										
					$.ajax({
						dataType: 	app.communicationType,
						type:		modelDefinition.type,
						data:		((modelDefinition.type!='GET') ? parameters : null), // TODO: if method==post, check if parameters is an object and stringify it
						url:		app._parseString(modelDefinition.url,parameters),
						success:	function(result){
							if (modelDefinition.processor!=null) result = modelDefinition.processor(result);
							developerHandler(result);
						},
						error:		function(jqXHR, textStatus, errorThrown) {
							modelDefinition.error(jqXHR, textStatus, errorThrown);
						}
					});
				}
			})(i);
			

			newModel.name = name;
			this[name]	= newModel;
			LOG("created new model called '"+name+"'");
		}
	},
	
	/**
	 * observed models represent JS data objects that notify views (optionally) as soon as
	 * they get updated via AJAX. If you want to add a property to a model, 
	 * do not simply call 'model.attr = 123', but in order to make it observable,
	 * call 'model.addProperty('attr'); model.attr = 123'.
	 * While usual models in rattata are simple wrapper functions to trigger an
	 * AJAX call (app.models.toDo.getToDoItems({...},resultHandler)), observable models
	 * are classes you can initiate like var model = new app.models.toDo(); and then
	 * call model.get({...});. Then, use the model.onUpdate = function(){...} to handle
	 * what happens as soon as the model gets modified.
	 * 
	 * The observed model is available in the app.models list.
	 */
	observedModels:	{
		define:	function(name, core) {
		
			if (app.models[name]) {
				WARNING("Duplicate model definition found for '"+name+"'");
				return false;
			}
			
			/**
			 * make this model instantiable by building it as a function.
			 * A model can have the four CRUD methods 'create', 'read', 'update', 'delete',
			 * and a method 'error' that handles AJAX communication errors.
			 * The default HTTP methods for the CRUD methods are PUT, GET, POST and DELETE,
			 * but the developer can define which type to use by prefixing the URL with one
			 * of the methods and a letterspace: read: 'GET api/make/toDo'.
			 * Parameters will be transmitted according to the HTTP type. The developer can
			 * define how to encode data as query by overwriting the app.serializeData()
			 */
			app.models[name] = function(initialData) {
				var self	= this,
					keys	= Object.keys(core),
					i		= 0,
									
					/**
					 * default HTTP types for the four methods in the right order:
					 */
					HTTPtypes	= ['PUT','GET','POST','DELETE'],
					operations	= ['create','read','update','del'], // 'CRUD'
					urls		= [core.create, core.read, core.update, core.del];
				
				/**
				 * At first, inject the initial data into the model, so that st. like * is
				 * possible.
				 * * var model = new app.models.model({id: 12, content:'hello World'});
				 */
				$.extend(this,initialData);

				/**
				 * check if the developer has overwritten the HTTP type using a prefix
				 * on the url (e.g. 'GET api/todo/make')
				 */
				for(var url in urls) {
					if (urls[url]) {
						var parsingResult	= app._parseUrlDefinition(urls[url]);
						HTTPtypes[url]		= parsingResult.httpType;
						urls[url]			= parsingResult.url;
					}
				}
				
				/**
				 * the developer CAN specify an updateHandler directly in the model
				 * definition, which is not recommended. He should rather define it
				 * after instantiating the object.
				 */
				if (core.updateHandler==null) this.updateHandler	= function(){};
				else this.updateHandler = core.updateHandler;

				/**
				 * The name of this model
				 */
				this._name	= name;
				
				/**
				 * An error handler can be defined directly in the model,
				 * otherwise, the default error handler will be used in case of
				 * AJAX error event
				 */				
				this.errorHandler		= core.error || function(a,b,c) {
					app.defaultCommunicationErrorHandler(a,b,c);
				};
				core.error				= undefined;
	
				/**
				 * Using this function, the developer can define a function to handle
				 * communication error right inside the controller instead of defining
				 * it via the model definition
				 */
				this.onError	= function(handler) {
					self.errorHandler	= handler;
				};
				
				/**
				 * Using this function, the developer can define a function that
				 * handles the update event for this model (e.g. re-rendering
				 * a view)
				 */
				this.onUpdate	= function(handler){
					self.updateHandler	= handler;
				};
				
				/**
				 * To get the raw data of this model, call the following method.
				 * Since the model also contains functions and internal variables, not the whole
				 * model may be transmitted to the server after being serialized.
				 * So this function extracts the data from the model and returns it.
				 */
				this.extractData	= function(){
					var object	= {},
						keys	= Object.keys(this)
					for(var property in self) {
						if (typeof self[property] !='function' && property.substr(0,1)!='_') object[property] = self[property];
					}
					return object;
				};
				
				/**
				 * To add an observable attribute to this model object, call the following method.
				 * (is being used whenever new data will be pushed into the model using AJAX)
				 */
				this.addProperty	= function(propertyName, optionalInitialValue) {
					
					// Information hiding
					(function(){
						var property = (optionalInitialValue!=undefined) ? optionalInitialValue : undefined;
						Object.defineProperty(self, propertyName, {
							get:	function() { return property; },
							set:	function(val) {
								property	= val;
								self.updateHandler();
							},
							enumerable: true,		// is necessary so that the object can be serialized using $.param() and trasmitted to the server
							configurable: true		// is necessary so that future AJAX requests can alter the just created property
						});
					}());
				}
				
				/**
				 * In order to make this object able to be output via alert(), define
				 * the toString method
				 */
				this.toString 		= function(){
					return 'Please use the extractData() method on observed models to output its content via the console or alert()';
				};
				
				/**
				 * define the four CRUD methods create(), read(), update() and del()
				 */
				for(var i=0;i<operations.length;i++) {
					(function(index){
						var operation	= operations[i];
						
						if (urls[index] == undefined) {
						
							self[operation]	= function(){
								WARNING("For the observed model '"+this._name+"' no URL for the '"+operation+"' method has been specified.");
							};
						
						} else {
						
							/**
							 * define the function itself so that it is available on the model object,
							 * e.g. model.read(); or model.update();
							 * Calling on of these four method will sync the local data with the one
							 * on the server.
							 * The developer can inject additional URL parameters into the AJAX url, so that
							 * it is possible to code model.get({access_token: 'fdgh345g2'});. The injected
							 * data will be inserted in the url the user has specified in the 'read' url:
							 * read: 'GET http://api.domain.com/info/?accesstoken={access_token}.
							 * Do NOT mix that up with the actual data that will be passed to the server
							 * and originates from the model object itself.
							 */
							self[operation]	= function(additionalUrlParameters){
								var data	= app.serializeData(HTTPtypes[index],self.extractData());
								urls[index]	= app._parseString(urls[index],additionalUrlParameters);
								$.ajax({
									url:	urls[index],
									type:	HTTPtypes[index],
									data:	data,
									dataType:app.communicationType,
									success:	function(result){
										/**
										 * Instead of calling $.extend(this,result), we have to adapt
										 * each attribute on its own to make it observable
										 * TODO: check if result is an numeric array ?!
										 * 		 (if server responds st. like "['a','b','c']", the attr
										 * 		  in the following code are numbers, so that addProperty
										 * 		  will probably fail!)
										 */
										for(var attr in result) {
											self.addProperty(attr, result[attr]);
										}
										self.updateHandler();
									},
									error:		function(a,b,c){
										self.errorHandler(a,b,c);
									}
								});
							};
						}
					})(i);
				}
				
				LOG("created new observed model called '"+name+"'");
			}
		}
	},
	
	/* Views */
	views:		{
		current:	null,
		
		defaultSwitcher: function(oldView, newView, callback) {
			//if (oldView!=null) oldView.div.hide().addClass('hiddenRattataView').removeClass('currentRattatacView');
			//newView.div.show().removeClass('hiddenRattataView').addClass('currentRattataView');

			$(app.skeleton).html(newView.getContent());
			if (callback!=null) callback();
			
			/*
			$(app.skeleton).fadeOut(200,function(){
				$(app.skeleton).html(newView.rendered);
				$(app.skeleton).fadeIn(200,function(){
					callback();
				});
			});
			*/
		},
		
		/**
		 * views are defined by the app automatically after their file gets loaded completely
		 */
		_define: function(name){
			LOG("attempting to make new view called '"+name+"'");
			
			// create the new view
			var newView = {
				// name of the view
				name:		name,
				// the div in which the rendered content of the view is being stored
				div:		$('#'+name+'__rendered'),
				rendered:	'',
				
				// the div in which the template (the unrendered view) is being stored
				template:	null, // is (re)set in render()
				
				/**
				* (re)renders this view using the given data model object,
				* the result is stored in the corresponding div, but the view
				* won't be shown automatically
				*/
				render:		function(data) {
					LOG("rendering view '"+this.name+"' with the following data",data);
					
					this.template = $('#'+this.name+'__template'); //TODO: kann der selector hoch, wie div?
					
					// store the result in the variable
					this.rendered  = this.template.jqote(data, app.templateDelimiter);

					// for chaining
					return this;
				},
				
				/**
				 * place rendered content into 
				 */
				into:	function(selector) {
					var target	= $(selector);
					if (!target.length) {
						LOG("no element found for placing render result of view '"+this.name+"' into element based on selector '"+selector+"'");
						return null;
					} else if (!this.rendered) {
						LOG("no rendered content available for placing render result of view '"+this.name+"' into element based on selector '"+selector+"'");
						return null;
					}
					LOG("placing render result into element based on selector '"+selector+"'");
					
					target.html(this.rendered);
					
					// for chaining
					return this;
				},
				
				/**
				 * get rendered content of the view
				 */
				getContent:	function() {
					return this.rendered;
				},
				
				/**
				* marks this view as the active one and reveals it using a custom
				* function that handles the switching (think of animations to switch
				* to views or whatever) or the app's defaultSwitcher
				*/
				show: 		function(viewSwitcher) {
					LOG("showing the view '"+this.name+"'");					
					
					if (viewSwitcher==null) viewSwitcher = app.views.defaultSwitcher;
					
					viewSwitcher(app.views.current, this, function(){
						app.views.current = this;
						app.controllers.current.rebindUi(app.controllers.current);	
					});
					
					return this;
				}
			};
			
			// register the new view inside the app.views object
			this[name]	= newView;
			LOG("created new view called '"+name+"'");
		}
		
	},
	
	/* Controllers */
	controllers: {
		/**
		 * points to that controller that has a main method in it
		 */
		main:		null,
		
		/**
		 * points to the currently running controller  TODO:
		 */
		current:	null,
		
		/**
		 * call app.controllers.define({...}) in an external file to create a new controller
		 */
		define: function(name,core,optionalInputParameters){
		
			/**
			 * check if name is new
			 */
			if (this[name]!=null) {
				WARNING("Duplicate controller definition found for '"+name+"'");
				return false;
			}
			
			LOG("attempting to make new controller called '"+name+"'");
			
			var newController	= $.extend(core, {
				name:	name,
				
				run:	function(optionalParameters) {
					LOG("running controller '"+this.name+"'");
					if (this.main==null) WARNING("Controller '"+this.name+"' does not have a main method");
					else {
						app.controllers.current = this;
						this.main(optionalParameters);
					}
				},
				
				
				/**
				* Rebinds the UI elements of a view with the event handlers specified in this controller
				* (this function will be called automatically everytime you render a view)
				*/
				rebindUi: function(controller) {
					/**
					 * Cycle through the attributes of the controller and process those that contain
					 * a letterspace in their name, which indicates that they define an event-action
					 * binding matching the pattern '[EVENT(S)] [SELECTOR]',
					 * where EVENT(S) is a comma separated list of event names,
					 * e.g.:
					 * 
					 * 		'touchstart,click closeBox': function(){ ... }
					 * 
					 * IMPORTANT: this is making use of camel case. If your uiBindingPrefix is 'ui'
					 * and you define a CLICK binding for 'myElement', the view DOM has to contain
					 * a 'uiMyElement'
					 */
					if (controller==undefined) {
						LOG('No controller defined for rebinding the UI');
					} else {
						for(var key in controller) {
							if (key.indexOf(' ')==-1 || typeof controller[key]!='function') continue;
							
							(function(key){
								// if you define a 'click sayHello', the UI element has to be 'uiSayHello' (camel case), where 'ui' is the uiBindingPrefix specified in options
								var selector	= app.uiBindingPrefix + key.substr(key.indexOf(' ')+1,1).toUpperCase() + key.substr(key.indexOf(' ')+2),
									events		= key.substr(0,key.indexOf(' ')),
									eventHandler= function(event){
										controller[key](event,$(this));
									};
								
								events			= events.split(',');
								for(var i=0;i<events.length;i++) $(selector).bind(events[i], eventHandler);
							}(key));
						}
					}
				},
				
				/**
				 * activates this controller to be the currently running controller of the app
				 */
				activate: function(optionalParameters) {
					var query	= '';
					this.run(optionalParameters);
				
					if (app.enableBrowserHistory) {
						// updating window location hash
						if (optionalParameters!=null) {
							var keys	= Object.keys(optionalParameters),
								i = 0;
							for(i=0;i<keys.length;i++) query += keys[i]+'/'+optionalParameters[keys[i]]+'/';
						}
						window.location.hash = '/'+newController.name+'/'+query;
					}
				}
			});
			
			//
			
			/**
			* if this core has a isMainController flag, use this controller as the default
			* controller to run if no hash routing matching has happened
			*/
			if (core.isMainController!=undefined && core.isMainController==true) {
				if (app.controllers.main==null) app.controllers.main = newController;
				else WARNING("Multiple controllers found with flag isMainController ('"+name+"')!");
			}
			
			this[name]	= newController;
			
			// register this controller in the app's routing table
			app._registerControllerInRouting(this[name],optionalInputParameters);

			LOG("created new controller called '"+name+"'");
		}
	},
	
	plugins: {
		define: function(name, core) {
			/**
			 * check if name is new
			 */
			if (this[name]!=null) {
				WARNING("Illegal plugin definition found for '"+name+"'");
				return false;
			}
			
			LOG("attempting to inject new plugin called '"+name+"'");
			
			app[name] = core;

			LOG("injected new plugin called '"+name+"'");
		}
	},
	
	/**
	* loads all resources and runs the callback() as soon as loading is complete
	* (in the callback, you might wanna call the run() method on one of your controllers)
	*/
	ready: function(definition, optionalCallback) {
		var load = {},
			that = this,
			callback	= function(){
				/**
				 * the callback that gets run after completing all file loading operations
				 * does not only run the optionalCallback but also the internal _run method
				 */
				if (optionalCallback!=null) optionalCallback();
				app._run();
			};
			
		/**
		 * include both jQuery and jqote if they aren't loaded yet
		 */
		if (typeof jQuery == 'undefined') load = {first: '../rattata/jquery', second: '../rattata/jquery.jqote2.min'};
		if (typeof jQuery != 'undefined' && jQuery.jqote == null) load = {first: '../rattata/jquery.jqote2.min',second:null};
				
		/**
		 * read the transmit protocol
		 */
		this.protocol = window.location.protocol+'//';
		
		steal(load.first,load.second).then(function(){
			var m = app.models, v = app.views, c = app.controllers, p = app.plugins;
			
			// overwrites the default app definition with the developer's one
			jQuery.extend(that,definition);
						
			// re-inject the module (M, V or C) specific functions
			jQuery.extend(app.models,m);
			jQuery.extend(app.views,v);
			jQuery.extend(app.controllers,c);
			jQuery.extend(app.plugins,p);
			LOG('start building app');
			
			/**
			* load all required files before continuing building the app:
			* dependencies (js, css, less, ...), controllers, models, views
			*/

			// load other resources
			var files = [],
				fileCount,
				i;
			for(i=0;i<app.dependencies.length;i++) files.push(app.dependencies[i]);
			for(i=0;i<app.controllers.length;i++) files.push('controllers/'+app.controllers[i]);
			for(i=0;i<app.models.length;i++) files.push('models/'+app.models[i]);
			for(i=0;i<app.plugins.length;i++) files.push('plugins/rattata.'+app.plugins[i]);
			
			fileCount	= files.length;
			
			app._loadingCounter.inc(fileCount);
			for(var i=0;i<app.views.length;i++) app._loadingCounter.inc();

			for(var i=0;i<files.length;i++) {
				var path= files[i].split('/'),
					ext	= (path[0]!=null) ? path[0] : '';

				switch(true) {
					case (path.length==1 || ext=='js' || ext=='controllers' || ext=='models'):
						steal.resources(files[i]); break;
					case (ext=='css'):
						steal.css('resources/'+files[i]); break;
					case (ext=='coffee'):
						steal.coffee('resources/'+files[i]); break;
					case (ext=='less'):
						steal.less('resources/'+files[i]); break;
					case (ext=='http:'): 
						alert('http request not supported yet. Please embed via HTML dom.');
						break;
						
					case (ext=='plugins'):
						
						steal.plugins('rattata/'+files[i]); break;
						
						//steal.plugins('resources/'+files[i]); break;
				}
			}
			
			steal.then(function(){ app._loadingCounter.dec(callback,fileCount); });
			
			/**
			 * Views are handled differently.
			 * Their contents gets loaded asyncly and embedded into an script tag
			 * so that it's available for rendering operations later
			 */
			for(var i=0;i<app.views.length;i++) app._loadView(app.views[i],callback);
			
			/**
			 * set the <base> tag
			 */
			//if ($('head base').length==0) $('head').append('<base href="/resources/"></base>');
			

		});
	},
	
	_loadView:	function(file,callback) {
		var lc	= app._loadingCounter,
			body= $('body');
		
		// append the (unrendered) template to the end of the body, embodied in CDATA and with a unique Id
		$.get('resources/views/'+file+'.html', function(content){		
			var templateScriptName	= file+'__'+'template';

			body.append('<script type="text/x-jqote-template" id="'+templateScriptName+'">'+app._CDATA(content)+'</script>');
			
			// define the new view since loading was succesful
			app.views._define(file);
			
			lc.dec(callback);
		},'html').error(function(){
			WARNING('View file '+file+' could not be loaded');
			lc.dec(callback);
		});
	},
	
	_CDATA: function(content) {
		return '<![CDATA['+content+']]>';
	},
	
	/**
	* Resource loading counter: everytime a new resource request has been started, you have to call
	* the inc(). The _loadExternal() decrements the counter and fires the overallCallback() as soon
	* as all files have been loaded (== counter equals zero)
	*/
	_loadingCounter: {
		lc: 0,
		inc: function(amount){ if (amount==null) amount = 1; this.lc+=amount; },
		set: function(i){ this.lc = i; },
		dec: function(overallCallback,amount){
			if (amount==null) amount = 1;
			this.lc -= amount;
			if (this.lc==0) {
				LOG('building app complete, running builder callback');
				overallCallback();
			}
		}
	},
	
	/**
	* _parseString('/user/{id}/make/{what}/', {id: 123, what: 'comment'}
	* produces '/user/123/make/comment/'
	*/
	_parseString: function(str,data) {
		if (data==null) return str;
		
		var keys	= Object.keys(data),i;
		for(i=0;i<keys.length;i++) {
			var pos = str.indexOf('{'+keys[i]+'}');
			if (pos>=0) {
				return app._parseString( str.replace('{'+keys[i]+'}', data[keys[i]]), data);
				break;
			}
		}
		return str;
	},
	
	/**
	 * _parseUrlDefinition('POST http://api.domain.com') results in
	 * {httpType: 'POST', url: 'http://api.domain.com' }
	 * and the default is GET, so that 
	 * _parseUrlDefinition('http://api.domain.com') results in
	 * {httpType: 'GET', url: 'http://api.domain.com' }
	 * 
	 * If the developer has specified some general URL suffix, append it.
	 */
	_parseUrlDefinition: function(url) {
		var spacePosition = url.indexOf(' '),
			result	= {
				httpMethod:	'GET',
				url:		null
			};
		if (spacePosition >= 0 && spacePosition<=7) {
			result.httpMethod	= url.substr(0, spacePosition).toUpperCase();
			result.url			= url.substr(spacePosition+1);
		} else {
			result.url			= url;
		}
		result.url += app.modelUrlSuffix;
		return result;
	},
	
	/**
	 * _parseModelDefinition parses a model definition for simple models (not
	 * the observed models). Simple models can be specified in four ways:
	 * - using a string ('getTasks': 'http://api../tasks/{param}/..'),
	 * - using an enriched string, type as prefix ('getTasks': 'POST http://api../tasks/'),
	 * - using an array, two elements in array ('getTasks': ['GET http://.../', resultProcessorHandler(msg) ]
	 * - using an object ('getTasks': {
	 * 									url: 'http://.../',
	 * 									type: 'GET',
	 * 									processor: resultProcessor
	 * 									error: errorHandler
	 * 									}
	 */
	_parseModelDefinition: function(definition) {
		var defaults	= {
			url:		null,
			processor:	function(ajaxResult) {
				return ajaxResult;
			},
			error:		function(a,b,c) {
				app.defaultCommunicationErrorHandler(a,b,c);
			},
			type:		'GET'
		};
		
		if (typeof definition=='string') {
			var parsed	= app._parseUrlDefinition(definition);
			defaults.type		= parsed.httpMethod;
			defaults.url		= parsed.url;
		} else if($.isArray(definition)) {
			var parsed	= app._parseUrlDefinition(definition[0]);
			defaults.type		= parsed.httpMethod;
			defaults.url		= parsed.url;
			defaults.processor	= (definition[1]!=undefined) ? definition[1] : defaults.processor;
		} else if (typeof definition =='object'){
			$.extend(defaults,definition);
		}
		return defaults;
	},
	
	/**
	* adds a controller with its optional input parameters in the app's routing table
	* for routeMatching after all controllers have been loaded
	*/
	_registerControllerInRouting: function(controller,optionalInputParameters) {
		var query	= '',
			newRoute= '',
			keys	= ((optionalInputParameters!=null) ? Object.keys(optionalInputParameters) : []),
			i = 0;
		for(i=0;i<keys.length;i++) query += keys[i]+'/{'+keys[i]+'}/';
		newRoute	= '/'+controller.name+'/'+query;
		app.routing[newRoute] = controller.name;
	},
	
	/**
	* checks which controller has to be started based on the window location hash,
	* returns an object { controller, parameters: { ... }}
	*/
	_routeMatching: function(hash) {
		/**
		* Bsp: /trips/123/details/true MATCHES /trips/{tid}/details/{showDetails} with data {tid: ..., showDetails: ... }
		*/
		var keys	= Object.keys(app.routing),
			i		= 0;
		
		if (hash.substr(0,1)=='/') hash = hash.substr(1);
		
		for(i=0;i<keys.length;i++) {
			var route			= keys[i],
				varName			= '',
				varValue		= '',
				result			= { controller: null, parameters: {}},
				readingControllerName = true,
				controllerName	= '',
				h = 0;

			if (route.substr(0,1)=='/') route = route.substr(1);
				
			for(var c=0;c<route.length;c++) {
				
				var routeChar	= route[c],
					hashChar	= hash[h];
				
				if (routeChar =='/' && readingControllerName) {
					result.controller		= controllerName
					readingControllerName	= false;
				}
				if (readingControllerName) controllerName += routeChar;
				else {
					if (routeChar=='{') {
						// lies parameterName und parameterValue aus
						c++;
						varName	= route.substr(c, route.indexOf('}',c)-c);
						c += varName.length+1;
						var copyLength = (hash.indexOf("/",h)!=-1) ? hash.indexOf("/",h)-h : null;
						varValue= hash.substr(h, copyLength);
						h += varValue.length+1;
						
						if (varName!=null && varValue!=null) result.parameters[varName] = varValue;
						continue;
					}
				}
								
				if (routeChar!=hashChar) {
					result = null;
					break;
				}
				
				h++;
			}
			if (result!=null) {
				/**
				* if result!=null, it means that the hash matches one controller, return it
				* including the input parameters
				*/
				if (readingControllerName) {
					result.controller		= controllerName;
					if (result.parameters==null) result.parameters = {};
					readingControllerName	= false;
				}
				if (result.controller) result.controller = app.controllers[result.controller];
				if (result.controller==null) return false;
				return result;
			}
		}
	}
}

/**
* throws a warning execption
*/
function WARNING(str) {
	if (app.usage=='dev') throw('(Rattata.js WARNING) '+str);
}

/**
* logs a string to the console
*/
function LOG(str) {
	if (app.usage!='dev') return;
	if (arguments.length>1) {
		switch(arguments.length) {
			case 2: console.log('stealJS INFO:'+arguments[0],arguments[1]); break;
			case 3: console.log('stealJS INFO:'+arguments[0],arguments[1],arguments[2]); break;
			case 4: console.log('stealJS INFO:'+arguments[0],arguments[1],arguments[2],arguments[3]); break;
			case 5: console.log('stealJS INFO:'+arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]); break;			
		}	
	} else {
		steal.dev.log(str);
	}
}

/**
* outputs an object to the console
*/
function DUMP(obj) {
	console.log(obj);
}

/**
* fallback for browsers that do not support the Object.keys(obj) function, which
* returns all object property keys, only
*/
if(!Object.keys) Object.keys = function(o){
if (o !== Object(o))
throw new TypeError('Object.keys called on non-object');
var ret=[],p;
for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
return ret;
}
