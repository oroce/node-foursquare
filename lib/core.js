/*jshint expr:true*/

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

Core.apiPost = function( route, opts, callback ){
	opts = opts||{};
	if( _.isFunction( opts ) ){
		callback = opts;
		opts = {};
	}

	var deferred = Q.defer();
	var form = _.extend({}, this.config, opts.form||{} );
	delete opts.form;

	request(
		_.extend({}, opts, { form: form, url: "https://api.foursquare.com/v2" + route, json: true, method: "POST" }),
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
module.exports = Core;