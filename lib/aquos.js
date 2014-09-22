var net = require("net");

module.exports.Aquos = function(hostname, port, username, password) {
	this.hostname = hostname;
	this.port     = (typeof port != 'undefined') ? port : 10002;
	this.username = (typeof username != 'undefined') ? username : false;
	this.password = (typeof password != 'undefined') ? password : false;

	this.callback = false;
	this.hasSetup = false;

	// Make the TCP connection
	this.socket = new net.Socket();

	var self = this;

	/**
	 * This function connects and authenticates against a Sharp Aquos Remote Control Server
	 */
	self.connect = function(callback) {
		self.socket.on('connect', function() {
			process.stdin.setEncoding('utf8');

			// If no login is required, go ahead and setup
			if (self.username == false)
				self.setup();
		});	

		self.socket.on('data', function(data) {
			// If we detect the server asking for a login
			var sData = data.toString();

			if (sData.indexOf("Login") != -1)
			{
				if (!self.username || !self.password)
				{
					// This occurs when we do not have a username or password and the server is requesting it
					self.socket.destroy();
					return callback("Aquos is requesting authentication and either the username or password is missing.", null);
				}
				else
				{
					// Write authentication info
					self.socket.write(self.username + "\n" + self.password + "\n");

					// Also do one required action so we get an OK response if authenticated and setup
					self.setup();
					return;
				}
			} 
			else if (!self.hasSetup)
			{
				// Once we get the initial OK from the server we know we're authenticated and ready for sending commands
				if (sData.indexOf("OK") != -1)
				{
					self.hasSetup = true;
					return callback(null);
				} 
				else if (sData.indexOf("User Name or Password mismatch") != -1)
				{
					// Authentication failure
					self.socket.destroy();
					return callback("Invalid username or password.");
				}
			}
			else
			{
				if (sData.indexOf("ERR") != -1)
				{
					if (self.callback != false)
					{
						var cb = self.callback;	
						self.callback = false;
						cb("An unknown error occurred.", null); 
						return;
					}
				}
				else
				{
					var cb = self.callback;
						
					if (cb != false)
					{
						self.callback = false;
						return cb(null, sData);
					}
				}
			}
		});

		self.socket.on('close', function() {
			console.log("Connection Closed");
		});

		self.socket.on('error', function(err) {
			console.log("Error with connection");
			console.log(err);
		});
	}

	self.close = function() {
		self.socket.end();
	}
	/**
	 * This sends the TV Off Command
	 */
	self.setup = function() {
		self.socket.write("RSPW2   \x0D");
	}

	/**
	 * Channel Up
	 * ***Untested***
	 *
	 * @param callback callback a function with an error or success of changing the channel down
	 */
	self.channelUp = function(callback) {
		self.callback = callback;
		self.socket.write("CHUP0   \x0D");
	}

	/**
	 * Channel Down
	 * ***Untested***
	 *
	 * @param callback callback a function with an error or success of changing the channel down
	 */
	self.channelDown = function(callback) {
		self.callback = callback;
		self.socket.write("CHDW0   \x0D");
	}


	/**
	 * Mute getter/setter
	 *
	 * @param input boolean Either null to retrieve current mute state, or true to mute it or false to unmute
	 * @param callback callback a function with an error or the current power state
	 */
	self.mute = function(mute, callback) {
		self.callback = callback;

		if (mute == null)
		{
			self.socket.write("MUTE?   \x0D");
		}
		else
		{	
			// For some reason to UNMUTE I need to provide the number 2, not 0
			self.socket.write("MUTE" + ((mute == true) ? 1 : 2) + "   \x0D");
		}
	}
	/**
	 * Power getter/setter
	 *
	 * @param input integer Either null to retrieve current power state (1 on, 0 off), or a true/false boolean to turn it on or off
	 * @param callback callback a function with an error or the current power state
	 */
	self.power = function(power, callback) {
		self.callback = callback;

		if (power == null)
		{
			self.socket.write("POWR?   \x0D");
		}
		else
		{	
			var ipower = (power == true) ? 1 : 0;
			self.socket.write("POWR" + ipower + "   \x0D");
		}
	}

	/**
	 * Input getter/setter
	 *
	 * @param input integer Either null to retrieve current input, or an integer between 1 and 9 for the input you wish to use
	 * @param callback callback a function with an error or the current volume input
	 */
	self.input = function(input, callback) {
		if (input != null && (input < 1 || input > 9))
			return callback("The given input must be between 1 and 9.");

		self.callback = callback;

		if (input == null)
		{
			self.socket.write("IAVD?   \x0D");
		}
		else
		{
			self.socket.write("IAVD" + input + "   \x0D");
		}
	}

	/**
	 * Volume getter/setter
	 *
	 * @param level integer Either null to retrieve current volume, or an integer between 0 and 60 for the volume you wish the TV to have i
	 * @param callback callback a function with an error or the current volume level
	 */
	self.volume = function(level, callback) {
		if (level < 0 || level > 60)
			return callback("The given volume level must be between 0 and 60.");

		self.callback = callback;

		if (level == null)
		{
			self.socket.write("VOLM?   \x0D");
		}
		else
		{
			var lvl = String('00'+level).slice(-2);
			self.socket.write("VOLM" + lvl + "  \x0D");
		}
	}

	/**
	 * Captioning Toggle
	 * This just turns on or off closed captioning depending on the current state
	 * *** WARNING: I don't think this actually works ***
	 *
	 * @param callback callback a function with an error or success
	 */
	self.captioning = function(level, callback) {
		self.callback = callback;

		if (level == null)
		{
			self.socket.write("CLCP?   \x0D");
		}
		else
		{
			var lvl = String('00'+level).slice(-2);
			self.socket.write("CLCP" + lvl + "  \x0D");
		}
	}


	self.socket.connect(self.port, self.hostname);
}
