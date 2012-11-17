/*jshint camelcase:true curly:true eqeqeq:true noempty:true quotmark:double undef:true expr:true node:true es5:true*/

"use strict";

var _ = require( "underscore" ),
		Q = require( "q" ),
		request = require( "request" );

var Core = function( attributes ){
	this.attributes = {};
	attributes || ( attributes = {} );
	if( attributes.accessToken ){
		this.accessToken( attributes.accessToken );
		delete attributes.accessToken;
	}

	this.set( attributes );
};
Core.defaults = {
	apiVersion: ""
};
Core.baseURL = "https://api.foursquare.com/v2";
Core.api = function( route, opts, callback ){
	opts = opts||{};
	if( _.isFunction( opts ) ){
		callback = opts;
		opts = {};
	}


	var deferred = Q.defer();
	var qs = _.extend({}, this.config, opts.qs||{} );
	delete opts.qs;
	request(
		_.extend({}, opts, { qs: qs, url: "https://api.foursquare.com/v2" + route, json: true }),
		function( err, response, body ){
			if( err ){
				err._response = response;
				return deferred.reject( err );
			}
			body._response = response;
			deferred.resolve( body );
		}
	);
	return deferred.promise;
};
/*
Core.apiPost = function( route, opts ){
	opts = opts||{};
	if( _.isFunction( opts ) ){
		callback = opts;
		opts = {};
	}

	var deferred = Q.defer();
	var form = _.extend({}, this.config, opts.form||{} );
	delete opts.form;

	request(
		_.extend({}, opts, { form: form, url: "https://api.foursquare.com/v2" + route, json: !!form.file, method: "POST" }),
		function( err, response, body ){
			if( err ){
				err._response = response;
				return deferred.reject( err );
			}
			body._response = response;
			deferred.resolve( body );
		}
	);
	return deferred.promise;
};
*/
Core.apiCall = function( opts, callback ){
	var method = !opts.method||opts.method === "GET" ? "qs" : "form",
			deferred;
	opts = opts||{};
	console.log( "precheck", method === "qs" , ( opts.form && opts.form.constructor.name !== "Object" ) )


	if( method === "qs" || ( opts.form && opts.form.constructor.name !== "Object" ) ){
		
		opts[ method ] = opts[ method ]||{};
		_.extend( opts[ method ], {
			"client_id": Core.config.client_id,
			"client_secret": Core.config.client_secret,
			"v": Core.config.v
		});
	}
	deferred = Q.defer();
	console.info( "calling request with params: ", opts );
	request(
		opts,
		function( err, response, body ){
			if( err ){
				err._response = response;
				return deferred.reject( err );
			}
			body._response = response;
			deferred.resolve( body );
		}
	);
	return deferred.promise;
};

Core.prototype.set = function( key, value ){
	var obj = {};
	if( _.isString( key ) ){
		obj[ key ] = value;
	}
	else{
		obj = key;
	}
	for( var i in obj ){
		if( obj.hasOwnProperty( i ) ){
			this.attributes[ i ] = obj[ i ];
		}
	}
	return this;
};

Core.prototype.get = function( key ){
	if( !key ){
		return this.attributes;
	}
	return this.attributes[ key ];
};

Core.prototype.toJSON = function(){
	return this.get();
};

Core.prototype.accessToken = function( value ){
	if( typeof value === "undefined" ){
		return this._accessToken;
	}
	this._accessToken = value;
	return this;
};

Core.prototype.hasAccessToken = function( callback ){
	if( !this.accessToken() ){
		var error = new Error( "Missing access token!" );
		if( callback ){
			callback( error );
			return false;
		}
		throw error;
	}

	return true;
};

Core.prototype.url = "";
module.exports = Core;