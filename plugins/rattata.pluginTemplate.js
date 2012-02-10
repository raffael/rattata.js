(function(app){

	var core	= {
		// this method will be available via app.pluginName.sayHell()
		sayHello: function(yourName) {
			alert('Hello, '+yourName);
		}
	};
	
	app.plugins.define('pluginName',core);
	
})(app);