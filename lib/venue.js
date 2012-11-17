/*jshint camelcase:true curly:true eqeqeq:true noempty:true quotmark:double undef:true expr:true node:true es5:true*/

"use strict";

var _ = require( "underscore" ),
		Core = require( "./core" ),
		Notification = require( "./notification" ),
		Checkin = require( "./checkin" ),
		fs = require( "fs" ),
		Photo = require( "./photo" );
var Venue = function( attributes ){
	Core.apply( this, arguments );
};

/**
	* static methods
**/

Venue.findById = function( id, callback ){
	var promise = Core.apiCall.call( this, {
		url: Core.baseURL + "/venues/" + id,
		json: true
	});
	if( !callback ){
		return promise;
	}
	return promise
		.then(function( body ){
			//console.log( "then", body, body._response )
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
	var promise = Core.apiCall.call( this, {
		url: Core.baseURL + "/venues/search",
		json: true,
		qs: _.pick( opts, "ll", "near", "llAcc", "alt", "altAcc", "query", "limit", "intent", "radius", "sw", "ne", "categoryId", "url", "providerId", "linkedId" )
	});
	if( !callback ){
		return promise;
	}
	return promise
		.then(function( body ){
			var ret = {
				_response: body._response
			};
			if( body.response.venues ){
				ret.venues = body.response.venues.map(function( attrs ){
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
	if( !this.hasAccessToken( callback ) ){
		return;
	}

	var promise = Core.apiCall({
		method: "POST",
		url: Core.baseURL + "/checkins/add",
		json: true,
		form: _.extend({}, _.pick( opts, "eventId","shout","mentions","broadcast","ll","llAcc","alt","altAcc"),{
			"venueId": this.get( "id" ),
			"oauth_token": this.accessToken()
		})
	});

	if( !callback ){
		return promise;
	}

	return promise
		.then(function( body ){
			console.log("checkin cb", body );
			var ret = {
				_response: body._response
			};

			if( body.response.checkin ){
				ret.checkin = new Checkin( body.response.checkin );
			}
			callback( null, ret );
		})
		.fail(function( error, response ){
			error._response = response;
			callback( error );
		});
};

Venue.prototype.uploadPhoto = function( opts, callback ){
	var self = this,
			fn,
			filename;
	if( !this.hasAccessToken( callback ) ){
		return;
	}
	
	fn = function( buffer ){
		Photo.add({
			"venueId": self.get( "id" ),
			"checkinId": opts.checkin.get( "id" ),
			"oauth_token":  self.accessToken(),
			"file": buffer
		})
		.then(function( body ){
			//console.log( "then cb", body.toString("utf8") );
			callback( null, body );
		})
		.fail(function( err ){
			//console.log( "fail cb", arguments );
			callback( err );
		});
	};
	
	if( _.isString( opts.file ) ){
		return fn(opts.file);
		fs.readFile( opts.file, function( err, buffer ){
			if( err ){
				return callback( err );
			}
			fn( buffer );
		});
	}
	else if( opts.file instanceof Buffer ){
		return fn( opts.file );
	}
	else{
		callback( new Error( "no file or stream wasn't passed" ) );
	}
};

Venue.prototype.checkinWithPhoto = function( opts, callback ){
	//console.log( "checkin photo init" );
	var self = this;
	if( !this.hasAccessToken( callback ) ){
		return;
	}
	var file = opts.file;
	delete opts.file;
	return this.checkin(opts, function( err, body ){
		//console.log("checkin cb ");
		if( err ){
			console.log( "checkin err", err );
			return callback && callback( err );
		}
		//console.log( "checkin", body );
		if( !body.checkin ){
			console.error( arguments );
		}
		var checkin = body.checkin.accessToken( self.accessToken() );
		
		self.uploadPhoto({
			file: file,
			checkin:  checkin
		}, callback );
	});
};
module.exports = Venue;