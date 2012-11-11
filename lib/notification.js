var _ = require( "underscore" ),
		Core = require( "./core" );
var Notification = function( attributes ){
	Core.apply( this, arguments );
};

_.extend( Notification.prototype, Core.prototype );


module.exports = Notification;