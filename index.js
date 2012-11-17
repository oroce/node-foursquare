/*jshint camelcase:true curly:true eqeqeq:true noempty:true quotmark:double undef:true expr:true node:true es5:true*/

"use strict";

var modules = {
	Core: require( "./lib/core" ),
	Venue: require( "./lib/venue" )
};
module.exports = function( config ){
	if( !config ){
		throw new Error( "Provide please the config!" );
	}
	config.v = config.v||(function(){
		var d = new Date();
		return d.getFullYear()+( "0"+ (d.getMonth()+1) ).slice(-2)+( "0"+ d.getDate() ).slice(-2);
	})();
	Object.keys( modules ).forEach(function( m ){
		modules[ m ].config = config;
	});
	return modules;
};