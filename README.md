# What is Rattata.js
	When we built Rattata.js, we were first building an application based on it before implementing the actual underlying framework. Step by step, we could watch the application becoming alive.
It's a very rough MVC architecture built in Javascript for your upcoming web app.

* * *

# License
rattata.js is released under the MIT license (http://en.wikipedia.org/wiki/MIT_License).

# What libraries does Rattata depend on?
Rattata.js uses *jQuery* for coding acceleration, *stealJS* for resource management & code compression and *jQote2* as templating engine.

# Sow let's start — how do I begin writing an app?
Since Rattata.js uses stealJS as resource mananager, structure templates are available as well.

0. Download Navigate to the stealJS folder of the Rattata.js download using the Terminal.
1. Run **./js steal/generate/rattataApp MyFirstApp**.A folder *MyFirstApp* will be created automatically with some demo controllers, models and views.
3. Open *MyFirstApp.js* to start extending the foundation.

# The longer version of creating an app
Let's have a look at the manual way of instantiating a new Rattata.js based application.

0. Create a new folder for your app with the following structure:
	
	´/yourApp
		/resources
			/js (this is where external JS plugins are stored)
			/css (your css files)
			/models (your data model descriptions)
			/views (your HTML templates)
			/controllers (your magical controllers)´
    
1. Make a .js file in the root of your app folder and paste the following lines of code in:
	
	´steal( 'appmvc/appmvc' ).then(function(){
		var yourApp = {
			dependencies:	['css/base'], // include the css file 'css/base.css'
			models:			['facebook'],
			views:			['welcomeView'],
			controllers:		['welcome'],
		skeleton:			'#app',
		}
		app.build(yourApp);
	});´
	
In this file you have specified the basic setting of your app: you have one model, one view and one controller and all of the HTML goes into the #app div of your DOM.

2. Next, make a .html file in your app root folder and paste something similiar to the following lines of code:
	
	´<!doctype html>
	<html>
	  <head>
		</head>
		<body>
			<h1>This is a Rattata.js based application</h1>
	        <div id="app"></div>
			<script type="text/javascript" src="../steal/steal.js?appmvcdemo/appmvcdemo.js">
	        </script>
		</body>
	</html>´

3. Now let's construct the controller. Just create file 'welcome.js' in the '/resources/controllers' folder and paste the following lines:
	
	´app.controllers.extend('welcome',{
		isMainController: true,
		
		main: function(){
			app.views.welcomeView.render({}).show();
		},
		
		'click reload': function(){
			var myFBname = prompt("What's your nickname on facebook?");
			app.models.facebook.getFullname({id: myFBname}, function(data) { 
				app.views.welcomeView.render(data).show();
			});
		},	
	});´
	
The main() function will be executed automatically as soon as the app is being executed, since we've marked the controller as main controller. If we click on a UI element called 'uireload' ('ui' is the UI element prefix), you get prompted for your facebook nickname, which will be used to fetch your fullname.

4. Let's build our model 'facebook'. Make a file 'facebook.js' in your '/resources/models' folder:
	
	´app.models.extend('facebook',{
	  'getFullname': ['GET', 'http://graph.facebook.com/{id}', function(result){
			result.fullname = result.first_name + result.last_name;
			return result;
		}]
	});´
	
Here, we're creating a new model named 'facebook' and specify one method called 'getFullname' which gets its data from via GET from the social graph using the parameter {id} of our controller. The optional function defines a data enrichment to post-process the data result. In this case, we are synthetically creating a new property 'fullname' using the first_ and last_name properties.

5. And now, we're creating the view: Make a file 'welcomeView.html' in the right folder and paste the following lines:
	
	´<h2>Hello World<*= (this.fullname!=null) ? ', '+this.fullname : '' *></h2>
	<p>Click on the button below to get a personalized Welcome message.</p>
	<button class="uireload">Give me a personalized Welcome message, please!</button>´

That's it. Nice, huh?