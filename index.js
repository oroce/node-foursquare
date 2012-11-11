var modules = {
	Venue: require( "./lib/venue" )
};
module.exports = function( config ){
	if( !config ){
		throw new Error( "Provide please the config!" );
	}
	config.v = config.v||(function(){
		var d = new Date();
		return d.getFullYear()+( "0"+ (d.getMonth()+1) ).slice(-1)+( "0"+ d.getDate() ).slice(-1);
	})();
	Object.keys( modules ).forEach(function( m ){
		modules[ m ].config = config;
	});
	return modules;
};