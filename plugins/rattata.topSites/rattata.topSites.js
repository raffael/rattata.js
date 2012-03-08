(function(app){

	// assumes, there's an /resources/images/appIcon.png file that represents the app icon
	if(window.navigator&&window.navigator.loadPurpose==="preview"){
			var css	= '';
			css+='#topsites-preview-wrapper {';
			css+='	top: 0;';
			css+='	left: 0;';
			css+='	right: 0;';
			css+='	bottom: 0;';
			css+='	position: absolute;';
			css+='	background: #333;';
			css+='	z-index: 10;';
			css+='}';
			css+='#topsites-preview-wrapper img {';
			css+='	position: absolute;';
			css+='	top: 50%;';
			css+='	left: 50%;';
			css+='	width: 400px;';
			css+='	height: 400px;';
			css+='	margin: -200px 0 0 -200px;';
			css+='  border-radius: 60px;';
			css+='  -webkit-box-shadow: 0 30px 100px black;';
			css+='}';
			
			var html= '<div id="topsites-preview-wrapper"><img src="resources/images/appIcon.png" /></div>';
			$('head').append('<style>'+css+'</style>');
			$('body').html(html);
		
	}
	
})(app);