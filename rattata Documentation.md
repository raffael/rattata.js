
# Rattata.js #
## API (Application Programming Interface) Documentation ##

* * *

## Introduction ##
	
Rattata.js is a lightweight application framework for single-page JavaScript based applications. The underlying application architecture is based on the MVC (Model, View, Controller) architecture. Rattata.js really only provides basic functionality and is not meant to be a widget library. The Rattata.js API arised from building an app with it first and deriving the syntax from it, instead of first developing Rattata.js.


## Dependencies ##

Rattata.js depends on the following JavaScript frameworks:

* stealJS
stealJS is a powerful library for managing resources in your JavaScript app. Next resource loading, it provides a streamlined method to generate an folder and files structure for your apps and to bundle all files and compress them for the live version of your app.

* jQuery
jQuery is sort of a really nice JavaScript enhancer.

* jQote2
jQote2 is a powerful JavaScript based templating system which allows to let the views contain simple logic.

## How to start ##

1. Generating a folder structure
Since stealJS is deeply integrated into Rattata.js, it is easy let stealJS generate a Rattata.js based application based on a blueprint. To generate a new app, be sure to have both the 'js' shell application and the 'rattata' framework folder in the directory where you want to generate a new app into. In the terminal, cd to the directory and run

	./js steal/generate/rattataApp (YourAppName)  
	
This will generate a new folder named YourAppName based on the rattataApp template, that contains a folder structure with example files in it, e.g. for models, views and controllers. 

2. Configuring your Rattata.js based app does not need a lot of effort. Open the yourAppName.js file in the newly created folder. Modify the myAppConfig object to fit your needs: specify which files you want to depend on and other options (see 'App configuration').

3. Preview your app
Open the yourAppName.html file in your browser and you should be presented with the running app.


## Coding with Rattata.js ##

After generating a new app as described above, you will find two files on the top-level of your app folder: yourAppName.js and yourAppName.html. These two files should be the only two files on top-level if you want to have a cleaned up folder structure. Put all assets (CSS, LESS, Images, JS-Plugins, ...) into the right folder of '/resources'.
Coding with Rattata.js means defining the global *app* object and executing one of the controllers to start the app.
The app object is configured in the yourAppName.js file. Every property you add in the myAppConfig object will be a property of the app object later on after calling the app.ready(configuration, callback); method. Appending properties to the app object is a simple way to define global accessable data objects, but you should be careful and have a tidy app object. Recommendation: add a *global* attribute inside the myAppConfig object where you can append global data during app execution to have a container for all your global data at once.

## Defining models ##
Rattata.js' basic models are very simple AJAX call wrapper. To define a model, e.g. 'userModel', make a new file called 'userModel.js' (or similar) and append it to the *models* array of your myAppConfig.
Next, open the userModel.js file and write

	app.models.define('userModel', core);

while core is an object to define the model's methods:

	app.models.define('userModel',{
		getUserName:	urlString,
		editUserData:	[postUrl,postProcessorHandler]
	});

while urlString is a simple URL like 'http://api.yourAppName.com/get/user/{id}' or a complex URL like 'GET http://api.yourAppName.com/get/user/{id}'. Complex URLs have a HTTP type prefix in front of the actual URL so that you can define whether you want to use GET, POST, PUT or DELETE while calling the server.
Next, as you can see, we can define placeholders right inside the URL definition. You will read more about that below.
*editUserData* in the example above is the advanced way to define the AJAX call. If you use an array with two elements to define the method, the first entry of the array is either a simple or a complex URL and the second is a post-processing function that will be called as soon as the AJAX result is returned by the server. Use this function to enrich or clean up the AJAX result, but be sure to return it afterwards, e.g.:

	function(userAjaxResult) {
		userAjaxResult.name = userAjaxResult.firstName + ' ' + userAjaxResult.lastName;
		return userAjaxResult;
	}
The most advanced way to define a model method is by defining an object that contains the four values *type*, *url*, *processor* and *error*:

	app.models.define('userModel',{
		getCriticalUserData:	{
			type:		'GET',
			url:		'http://api.yourAppName.com/get/user/{id}',
			processor:	function(userAjaxResult) {
				// (enrichments)
			},
			error:		function(a,b,c) {
				// (error handling)
			}
		}
	});

Rattata.js automatically transforms both of the two ways to define a model methods into real methods, so that you can later execute them in your controller using
	app.models.userModel.editUserData(null,function(processedResult){
		console.log(processedResult)
	});

Of course, since the model is just a normal JavaScript object, you can define own methods or own properties:
	app.models.define('userModel',{
		[...],
		parseUnixTimestamp: function(timestamp){[...]}
	});

If you look at the urlString from above, you will find enbedded placeholders using the syntax *{placeholderName}*. You can use them to define how to transfer data from your app to the server. Say, you want to retrieve user data from the server which is possible by using a userId or by using a lastName attribute.
	app.models.define('userModel',{
		getUserData: 'GET http://api.youAppName.com/get/user/?basedOn={basedOn}&identification={id}/'
	});

In your controllers, you can make a method call with input parameters like this:
	app.models.userModel.getUserData({basedOn: 'lastname', identification: myUserObject.lastName},function(AJAXresult){
		console.log(processedResult)
	});
The two attributes of your *input data object* will be injected into the AJAX URL.

That is the way, basic Rattata.js models work. These models act more like container for AJAX calls. You can split all your AJAX calls of your app into classes like models, e.g. the 'userModel', the 'toDoListModel' model and so on.

## Defining observed models ##
Rattata.js also provides more advanced models, that provide enhanced functionality like observed attributes and CRUD principle implementation. Observed models can be instantiated, so they act like classes in OOP. The observed model objects are a local representation of the data records on your server's database and tend to be used using the CRUD principle (Create, Read, Update and Delete).
Let us check how observed models work while building a model structure for a To Do app. We need both a model for a task list to retrieve all the user's task items and a model for specific single task items.

	// file 'models/observedTaskList.js
	app.observedModels.define('observableTaskList', {
		identifier: 'tlid',
		create:	'POST api/todos.php/create',
		read:	'GET api/todos.php/read',
		update:	'POST api/todos.php/update'
	});
	
	app.observedModels.define('observableTask', {
		identifier: 'tid',
		update:	'POST api/todos.php/updateTask'
	});

As you can see, we can put multiple model definitions in one file, but in order to apply the famous Devide and Conquer principle, you ought to split them in two seperate files.
The definition of an observedModel is pretty similar to the definition of basic models. Notice the *observedModels.define* instead of *models.define*. The model, though, will be available under the *app.models* object!
One important difference is that observed models should only have four AJAX methods at maximum: *create*, *read*, *update* and *del* (**Note the 'del' instead of 'delete', since delete is a JavaScript command**). The four methods are optional. You can implement them using the same syntax as in the simple way of the basic models.
(**Note: no post processing possibility here.**)
(**Note: While the default HTTP type in the basic models is GET, the default HTTP type in observed models depend on the method: create() uses PUT, read() uses GET, update() uses POST and del() uses DELETE.**)

The usage of the observed models is different. You do not call the models itself as you do with basic models. Instead, you instantiate them and act on these objects to retrieve and write data:

	var taskList	= new app.models.observableTaskList(initialRecordData);

while *initialRecordData* is an optional JavaScript object which properties will be injected into the taskList object.
Say, you want to retrieve the task list 'Groceries' of the user from the server. Call:

	var taskList	= new app.models.observableTaskList({name: 'Groceries'});
	taskList.get();

This simply creates an local object of your task list with some initial data at first. Then it retrieves the data from the server. The whole taskList object will be transmitted to the server (all but the internal data and functions), that can than parse the request and send back the result.

Observed models also try to minimize the callback hell. Their name comes from the Observer pattern: They notify as soon as their data is being modified. You can define what happens if the model has been updated by an AJAX call or manual property modification using the *onUpdate()* method. You probably want to re-render a specific view with the new data:

	taskList.onUpdate(function(){
		// e.g. re-render views:
		// app.views.taskListView.render(this);
	});

In this example, after defining the onUpdate handler once, all future model modifications will re-render the view. So as soon as you perform a `taskList.get();`, the view will automatically be updated.

Be sure to define the onUpdate handler as soon as possible. You can even define the handler directly in the model definition, although you should define it per object manually:

	app.observedModels.define('observableTask', {
		[...],
		updateHandler: function(){
			// e.g. console.log(this); to ouput the model object
	});
**Note: not every single object property will be observed. Only top-level properties of AJAX results will be marked as observed variable. If you add a property to the model object manually, this does not trigger an onUpdate event.** If you want to add an observed property manually, call

	taskList.addProperty(propertyName,optionalInitialValue);

After that, if you modify the property using ´taskList.propertyName = 123´ will trigger the onUpdate handler.

Let's just have a look at some other use cases:

If you want the user to be able to create a record in your server's database, first instantiate the model as object, define the required properties and create the record using ´create()´:

	var newTaskItem	= new app.models.taskModel({
		title: 'Buy milk',
		due_date: '2012-12-24'
	});
	newTaskItem.create();

If you look at the server's input data from that call, you will see both of the two values *title* and *due_date* in the HTTP Request POST data.

Now, let's update the item both on local and server side:

	newTaskItem.title = 'Buy even more milk';
	newTaskItem.update();

That's easy.

**Note: Observed models are experimental. Rattata.js relies on beautiful syntax and one requirement was to automatically observe manually added properties and monitor every single model data modification painlessly.  Since the global definition of Setter and Getter in JavaScript still is not standardised, Rattata.js has to work around with existing methods like Object.defineProperty(). Every top-level AJAX result property will be observed. No recursive tree handling here!**

## Defining controllers ##
Controllers are the core of your application. They provide the bridge between user interaction in the views and data modification using the models.
Defining a controller is painless. Create the appropriate file in '/resources/controllers' and insert something similar to

	app.controllers.define(controllerName, core);

while core is an object that contains the actual controller implementation. Every controller has to implement at least one method, the main() method:

	app.controllers.define('helloWorld',{
		
		main: function(){
			// alert('helloWorld'); 
		}
	});

The main() method will be run as soon as you call ´app.controllers.helloWorld.activate()´. activate() marks the controller as the current one in the app scope. You can optionally pass data to the main() method using

	[...]
	main: function(data){
		// alert('Hello '+((data!=null) ? data.name: 'World')); 
	}
	[...]
	
	app.controllers.helloWorld.activate({name: 'John'});

activate() also updates the browser history hash. More on that below.

In order to define which of your controllers shall be started as soon as the app launches, you can set the *isMainController* flag to *TRUE* in the controller definition:

	app.controllers.define('helloWorld',{
		isMainController: true,
		[...]
	});
	
As soon as your app is loaded, the controller will be executed. This behaves as the main() method of Java programs do. Of course you can only mark one single controller as main controller
(**Note: If you use rounting, the main controller might not be the first controller to be executed.**)

Any other logic can be put into custom methods you define using the controller definition.

Since you also should handle user interaction in the controller, Rattata.js provides an easy way to handle UI events. Say you have an HTML element in your app that has been marked as UI element using the class prefix 'ui':
	
	<button class="uiCreateTask">Create Task</button>

Notice the Camel Case notation. You can define what happens as soon as the user interacts with the element by implementing an event handler:

	app.controllers.define('helloWorld',{
		[...],
		'click createTask': function(eventObject, elementObject){
			// console.log('Click on button called ' + elementObject.html());
		}
	});

Since Rattata.js relies on jQuery, every event that is defined by jQuery or one of its plugins can be used here. The event object, jQuery passes to the event handlers is available here, too. While you have access to the corresponding DOM element in jQuery using something similar to ´$(this)´, you can access the element using the second (*optional*) parameter *elementObject*.
If you want to bind multiple events with a selector, you can comma separate the name of the events as follows:

	'click,touchstart createTask': function(...){...},

**Notice the proper Camel Case notation:** The element is marked using the class **uiCreateTask** while the event handler uses **createTask** as selector, without the prefix. It is this way to force you to seperate CSS classes from JavaScript selector classes.
(**Note: you can change the UI element prefix by re-defining the 'app.uiBindingPrefix' property**).

## Defining views ##
While models and controllers are defined using JavaScript files, views are plain HTML files. This is justified by the fact that embedding template structures into ´< script >´ tags probably disables your HTML Editor's capability to syntax-highlight your HTML code.
In order to define a new view, simply create an HTML file in the ´/resources/views´ folder. Since Rattata.js used jQote2 as templating engine, you can embed pure JavaScript logic into the template to render JavaScript data. Be sure to have added the view file in your myAppConfig:

	<!-- file: /resources/views/taskListView.html -->
	<!-- some more advanced example here: -->
	<ul class="scrollable list">
		<* for (var i=0;i<this['list'].length;i++) { *>
			<li><input type="checkbox" class="uiMarkAsDone" id="task_<*= this.list[i].tid *>"<*= (this.list[i].done) ? ' checked' : '' *>><label for="task_<*= i *>"><*= this.list[i].title *></label></li>
		<* } *>
	</ul>

The data you pass to a view is available using the ´this´ operator.
Now in order to render the view using some data you have received from a model, call the render method. The view object is available in the ´app.views´ object and is named as the file is named:

	app.views.taskListView.render({list: [{tid: 1, title:'Buy milk', checked: true}, ... });

or more advanced:

	taskListModel.onUpdate(function(){
		app.views.taskListView.render(this);
	});
	taskListModel.get();

since the observed model itself can be passed to the view as data source. If you use basic models, you probably want to use:
	
	basicTaskList.getList({},function(AJAXresult){
		app.views.taskListView.render(AJAXresult);
	};

After rendering it, the view won't show up anywhere. The rendering result is only stored internally. You can reveal the rendered result by using the show() method of the view:

	app.views.taskListView.render(this).show();

If you want to provide some fancy animation function to reveal the view, specify a transition handler in the show() method:

	app.views.taskListView.render(this).show(function(){
		$('#taskList').slideDown();
	});

The view than will be injected into the HTML element that matches what you have configured in your myAppConfig.skeleton property, which is basically a jQuery selector (By default, this is '#app').
In order to re-bind the new HTML with the currently active controller's user interaction event handlers, the show() method automatically calls the controller's rebindUi() method.
If you do not want the view to be rendered into the skeleton, you can use the into() method:

	app.views.taskListView.render(this).into(selector);

**Note: Be sure to run the current controller's rebindUi() method manually.**

## Embedding Rattata.js plugins ##
Rattata.js comes with serveral plugins, that enhance the functionality of the app object optionally. All plugins are stored in the ´/plugins´ folder of Rattata.js with the following naming convention: if a plugin has the name 'PLUGIN', the implementation of the plugin is stored in rattata/plugins/rattata.*PLUGIN*/rattata.*PLUGIN*.js. You can embed and make use of the plugin after defining the app to load it via the app configuration:
	
	var myAppConfig = {
		[...],
		plugins: ['plugin','anotherPlugin']
	}

which results in loading the plugins *rattata.plugin.js* and *rattata.anotherPlugin.js*.
If the embedded plugins follow the conventions of building Rattata.js plugins and the name of the embedded plugin is ´embeddedPlugin´, the extended functionality is available via the

	app.embeddedPlugin

property.

## Defining custom Rattata.js plugins
While you can inject any kind of JavaScript file into your app either by embedding it via the *dependencies* attribute of your app configuration or by using the *script* tag in the root HTML document, you can also develop customized Rattata.js plugins which basically extend the app object with new functionality.
As an example, there is a plugin to enhance the app object with functionality for mobile applications. For writing new plugins, create a new folder *rattata.mobile* in the ´plugins´ directory of the Rattata.js framework. Inside the folder, create a new file called 'rattata.mobile.js' and copy'n'pase the content of the 'rattata.pluginTemplate.js' file.
This introduction should be simple enough to understand the principles of building plugins for Rattata.js.

## Routing
Rattata.js supports routing for your app so that you can access specific app states from a permalink.
Every controller is accessible using its name:

	http://yourAppName.com/#/helloWorld/parameter1/value1/parameter2/value2

will result in starting the app with the controller *helloWorld* and the input data ´{parameter1: 'value1', parameter2: 'value2'}´, instead of running the main controller.
You can specify custom routes using the *routing* property of your myAppConfig:

	var myAppConfig = {
		[...],
		routing: {
			'taskList/{taskListName}/maxItems/{maxItems}': taskListController
		}
	}

So, if you access the app using ´http://yourAppName.com/#/taskList/groceries/maxItems/12´, the controller *taskListController* will be executed using the specified data.

**Note: Be sure to have some set-up automation running before a controller is run by routing.**

## App configuration ##

[...]

## Conventions ##
*	The *app.ready()* method defines what happens as soon as all app dependencies have been loaded. You could fade out an loading screen in here, as an example.
*	The *app.templateDelimiter* defines how to embed JavaScript logic into your view templates. Default is an asteriks, so that you open and close JavaScript tags using <* [...] *> (See jQote2 for details).
*	You can disable routing and browserHistory by setting the flag *app.enableBrowserHistory* to FALSE.
*	You can specify the type of data structure (JSON, XML, ...) using the *app.communicationType* value. Default is 'json'.
*	The *app.serializeData(HTTPtype,dataObject)* can be overwritten in order to specify how data shall be transmitted to the server. Default is Slash notation: ´{property: value}´ will be translated to ´/property/value´.
*	No Warnings and no Console Loggings will be produced if you alter the *app.usage* to something different to 'dev'.


## Code Protection and Live Version ##
You can protect your code and increase performance by building the app using stealJS. In this process, all your JS and CSS resources will be merged into two files to reduce the number of HTTP requests while loading the app.
You compress your JS app using the command line tool. Cd to the parent folder of your app folder and run './js yourApp/scripts/build.js'. You'll see the executed code in the Terminal and you'll also see which files are being compressed. If not all of your JS files (models, controllers, libs, etc. – note that views are not compressed!) are listed here, something went wrong.
To troubleshoot, make sure your JS code is correct. Test your all of your code with JSLinter or something similar and avoid incorrect syntax like obj= { attr1: 'val', }; (note the comma).
Next, we also encountered some cases where the building process din't succeed in the first attempt but in the second or third. 

## Future plans ##
*	Support for languages