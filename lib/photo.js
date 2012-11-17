/*jshint camelcase:true curly:true eqeqeq:true noempty:true quotmark:double undef:true expr:true node:true es5:true*/

"use strict";

var _ = require( "underscore" ),
		Core = require( "./core" ),
		Notification = require( "./notification" ),
		qs = require( "querystring" ),
		request = require( "restler" ),
		Q = require( "q" ),
		fs = require( "fs" ),
		FormData = require( "request/node_modules/form-data" );

var Photo = function( attributes ){
	Core.apply( this, arguments );
};

Photo.add = function( opts, callback ){
	
	var deferred = Q.defer();
	
	var query = _.extend( _( opts ).pick( "checkinId","tipId","venueId","pageId","broadcast","public","ll","llAcc","alt","altAcc","postUrl","postContentId","postText", "oauth_token" ), {
				"client_secret": Core.config.client_secret,
				"client_id": Core.config.client_id,
				"v": Core.config.v
		});
	var del, list = [ "venueId", "tipId", "pageId", "checkinId" ];

	if( query.checkinId ){
		del = _( list ).without( "checkinId" );
	}
	else if( query.venueId ){
		del = _( list ).without( "venueId" );
	}
	else if( query.tipId ){
		del = _( list ).without( "tipId" );
	}
	else if( query.pageId ){
		del = _( list ).without( "pageId" );
	}
	del.forEach(function( key ){
		delete query[ key ];
	});
	query = qs.stringify( query );
	fs.stat( opts.file, function( err, data ){
		console.log( "statData", data );
		/*
		var r = request({
			headers: {
				"content-length": data.size
			},
			multipart: [{
				"content-type": "application/x-www-form-urlencoded",
				"body": qs.stringify( _.extend( _( opts ).pick( "checkinId","tipId","venueId","pageId","broadcast","public","ll","llAcc","alt","altAcc","postUrl","postContentId","postText", "oauth_token" ), {
					"client_secret": Core.config.client_secret,
					"client_id": Core.config.client_id,
					"v": Core.config.v
				}))
			},{
				"content-type": "image/jpeg",
				"content-disposition": "form-data; name='file';",
				"body": opts.file
			}]/
			method: "POST",
			url: Core.baseURL + "/photos/add?" + query*/
			/*form: _.extend( _( opts ).pick( "checkinId","tipId","venueId","pageId","broadcast","public","ll","llAcc","alt","altAcc","postUrl","postContentId","postText", "oauth_token" ), {
					"client_secret": Core.config.client_secret,
					"client_id": Core.config.client_id,
					"v": Core.config.v,
					"photo": fs.createReadStream( opts.file.path )
			})
		},
			function( err, response, body ){
				console.log( "photo cb", body, response);
				if( err ){
					err._response = response;
					return deferred.reject( err );
				}
				body._response = response;
				deferred.resolve( body );
			}
		);
		*/
	
		request.post(Core.baseURL + "/photos/add?"+query, {
			multipart: true,
			data: {
					"file": request.file( opts.file, null, data.size, null, "image/jpeg" )
			}
		}).on( "complete", function(data) {
			deferred.resolve( data );
				console.log( "restler cb complete", arguments );
		}).on( "error", function( err ){
			deferred.reject( err );
			console.log( "restler err", err);
		});
	});
	//var form = new FormData();
	/*_( opts )
		.chain()
		.pick( "checkinId","tipId","venueId","pageId","broadcast","public","ll","llAcc","alt","altAcc","postUrl","postContentId","postText", "oauth_token" )
		.each(function( value, key ){
			form.append( key, value );
		});
	[ "client_secret", "client_id", "v" ].forEach(function( key ){
		form.append( key, Core.config[ key ] );
	});
	form.append( "photo", fs.createReadStream( opts.file ) );
	form.submit( Core.baseURL + "/photos/add?"+query, function( err ){
			console.log( "photo cb",this, err );
			
			if( err ){
				//err._response = response;
				return deferred.reject( err );
			}
			//body._response = response;
			deferred.resolve( this );
		});
	});*/
	/*_( opts )
		.chain()
		.pick( "checkinId","tipId","venueId","pageId","broadcast","public","ll","llAcc","alt","altAcc","postUrl","postContentId","postText", "oauth_token" )
		.each(function( value, key ){
			form.append( key, value );
		});
	*/
	//
	/*, {
		header: {
			"content-transfer-encoding": "base64",
			"content-type":"image/jpeg"
		}
	});

	[ "client_secret", "client_id", "v" ].forEach(function( key ){
		form.append( key, Core.config[ key ] );
	});*/
	//console.log( "form", form )
	if( !callback ){
		return deferred.promise;
	}

	return deferred.promise
		.then(function( body ){

			var ret = {
				_response: body._response
			};
			if( body.response.photo ){
				ret.venue = new Photo( body.response.photo );
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

_.extend( Photo.prototype, Core.prototype );

module.exports = Photo;