var _ = require( "underscore" ),
		Core = require( "./core" );
		
var Checkin = function( attributes ){
	Core.apply( this, arguments );
};

_.extend( Checkin.prototype, Core.prototype );


module.exports = Checkin;