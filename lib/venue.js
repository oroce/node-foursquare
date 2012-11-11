var _ = require( "underscore" ),
		Core = require( "./core" ),
		Notification = require( "./notification" ),
		Checkin = require( "./checkin" );
var Venue = function( attributes ){
	Core.apply( this, arguments );
};

/**
	* static methods
**/
Venue.findById = function( id, callback ){
	var promise = Core.api.call( this, "/venues/"+ id );
	if( !callback ){
		return promise;
	}
	return promise
		.then(function( body ){

			var ret = {
				_response: body._response
			};
			if( body.response.venue ){
				ret.venue = new Venue( body.response.venue );
			}

			if( body.response.notification ){
				ret.notification = new Notification( body.response.notification );
			}

			callback( null, ret );
		})
		.fail(function( err ){
			callback( err );
		});
};

Venue.find = function( opts, callback ){
	var promise = Core.api.call( this, "/venues/search", opts );
	if( !callback ){
		return promise;
	}
	return promise
		.then(function( body ){
			var ret = {
				_response: body._response
			};
			if( body.response.venues ){
				ret.venues = body.response.venues(function( attrs ){
					return new Venue( attrs );
				});
			}

			if( body.response.notification ){
				ret.notification = new Notification( body.response.notification );
			}
			callback( null, ret );
		})
		.fail(function( err ){
			callback( err );
		});
};

_.extend( Venue.prototype, Core.prototype );

Venue.prototype.checkin = function( opts, callback ){
	if( !this.accessToken() ){
		var error = new Error( "Missing access token!" );
		if( callback ){
			return callback( error );
		}
		throw err;
	}
	var promise = Core.apiPost( "/checkins/add", _.extend( {}, { 
		form: { 
			venueId: this.get( "id" ),
			oauth_token: this.accessToken()
		}
	}, opts ) );

	if( !callback ){
		return promise;
	}

	return promise
		.then(function( body, response ){
			var ret = {
				_response: response
			};
			if( body.response.checkin ){
				ret.checkin = new Checkin( body.response.checkin );
			}
			callback( null, ret );
		})
		.fail(function( error, response ){
			err._response = response;
			callback( err );
		});
};
module.exports = Venue;