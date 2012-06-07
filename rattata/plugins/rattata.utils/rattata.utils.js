(function(app){

	var core	= {
		_cachedGetQuery: null,
		
		/**
		 * GET
		 * Equivalent version to PHP's $_GET method. Retrieves the chunk and caches
		 * all other ones for later
		 * @param	parameterName		The name of the GET field
		 * @return	the resulting string, NULL otherwise.
		 */
		GET: function(parameterName) {
			if (this._cachedGetQuery) return this._cachedGetQuery[parameterName];
			else {
				var pos	= window.location.href.indexOf('?'),
					query;
				if (pos==-1 || !(query=window.location.href.substr(pos+1))) return null;
				query	= query.split('&');
				for(var tupleIndex in query) {
					var chunk	= query[tupleIndex].split('=');
					if (this._cachedGetQuery==null) this._cachedGetQuery = {};
					this._cachedGetQuery[chunk[0]]=chunk[1];
				}
				return this._cachedGetQuery[parameterName];
			}
		},
		
		/**
		 * getBrowserVendor
		 * Returns the browser vendor prefix, if available.
		 * @param	-		-
		 * @return	the string that defines the browser vendor
		 */
		getBrowserVendor: function(){
			'webkit moz o ms khtml'.split(' ');
			switch(true) {
				case (window.navigator.appVersion.indexOf('WebKit')!=-1):
					return 'webkit';
					
				case (window.navigator.appVersion.indexOf('Firefox')!=-1):
					return 'moz';
				
				case (window.navigator.appVersion.indexOf('Opera')!=-1):
					return 'o';
				
				case (window.navigator.appVersion.indexOf('MSIE')!=-1):
					return 'ie';
				
				default:
					return '';
			}
		}
	};
	
	
	app.plugins.define('utils',core);
	
})(app);