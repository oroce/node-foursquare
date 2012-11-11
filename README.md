node-foursquare
===============

node.js library for foursqaure api

It's under development, DO NOT USE IN PRODUCTION.

There are couple of foursquare api libs out there (I know), but none of them can make interactions (like checkin etc), (node-4sq)[https://github.com/mowens/node-4sq] almost can.

Examples
--------

API isn't final!.

But here's some example. These are working now:

		var foursquare = require( "foursquare" )(
				client_id: "yyyyyy",
				client_secret: "xxxxxx"
			),
			Venue = foursquare.Venue,
			Notification = foursquare.Notification,
			Checkin = foursquare.Checkin;

		Venue.findById( "4e311a73628430b0810a6194", function( err, result ){
			// scumbag foursquare returns a lot of things in response, so result contains everything
			result.venue instanceof Venue; //true
			result.notification instanceof Notification; // true. Warning: result.notification will be null if you aren't logged in or foursquare hasn't sent it.

			// Here's come the good part:
			result.venue
				.accessToken( "user-access-token" ) // in express it could be: req.user.foursquare.accessToken or sg like that
				.checkin({
					shout: "SHOUT SOMETHING"
				}, function( err, result ){
					result.checkin instanceof Checkin; // true
				});
		});


Do you want raw JSON objects? That's okay:

		Venue.findById( "4e311a73628430b0810a6194" )
			.then(function( body, response ){
				// body contains the stuff
				// response the reponse object from request
			})
			.fail(function( err, response ){

			})

Hey is that `response` only available is i'm using promises? No:

		Venue.findById( "4e311a73628430b0810a6194", function( err, result ){
			if( err ){
				return console.log( "are you down foursquare?", err._response.statusCode );
			}
			var headers = result._response.headers;
			console.log( "i can call the api in the 1 hour ", headers[ "x-ratelimit-limit" ] - headers[ "x-ratelimit-remaining" ], "x times!" );
		});