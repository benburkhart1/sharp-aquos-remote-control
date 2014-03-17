# Sharp Aquos Remote Control

This projects attempts to give the user the ability to control their Sharp Aquos Television from
a Node.JS project via their TCP interface.


## Sharp Aquos Setup

1. Ensure the television is turned on.
2. Hit the 'Menu' button on your remote.
3. Navigate to 'Initial Setup'
4. Navigate to 'Internet Setup'
5. Navigate to 'Aquos Remote Control'
6. Enable the Remote Control functionality.
7. Go to Detailed Settings and set a username/password.


## SharpAquosRemoteControl Setup

npm install benburkhart1/sharp-aquos-remote-control


## SharpAquosRemoteControl Examples

Check out the sharp aquos remote control example application at:
	http://www.github.com/benburkhart1/sharp-aquos-remote-control-test

## How to Use This Library

The following program connects to my television on IP 192.168.1.111 port 10002, with 
the username 'admin' and the password 'password', turns on the television, checks if 
the input# is 5 (which is Component (digital cable) here), if it is, it then turns the 
volume to level 15, otherwise it mutes the volume.

```
var Aquos = require("sharp-aquos-remote-control").Aquos;

var gw = new Aquos("192.168.1.111", 10002, 'admin', 'password');

gw.connect(function(err) {
  if (err)
  {
    console.log(err);
    return;
  }

  gw.power(true, function(err, data) {
    // Get the Input #
    gw.input(null, function(err, data) {
      if (err)
      {
        console.log(err);
        return;
      }

      // If input # is 5 (Component here)
      if (data == 5)
      {
        console.log("Input # is 5, setting volume to 15");

        // Set the volume to 15
        gw.volume(15, function(err, data) {
          if (!err)
            console.log("Volume set to 15");
        });
      }
      else
      {
        console.log("Input # is " + data + ", muting volume");

        gw.mute(true, function(err, data) {
          if (!err)
            console.log("Muted volume");
        });
      }
    });
  });
});
```

## How it Works

Some models of the Sharp Aquos TV series contain a "Remote Control" setting
that allows the teleivision to be controlled via a TCP socket server. This
library connects and sends commands in the following format:


| Command  | Options | Newline     |
| -------- | ------- | -------     |
| 4 bytes  | 4 bytes | 1 byte 0x0d |


The options are always "?   "
which means "Get the value for this" or 1-4 numbers, space-right-padded, 
meaning 1 would be:
"1   "

168 would be:
"168 "


The commands are one of the following

| Command | Description     |
| ------- | -------------   |
| RSPW    | Restrict Power  |
| POWR    | Power           |
| VOLM    | Volume          |
| CLCP    | Closed Captioning  |
| IAVD    | Input           |
| CHUP    | Channel Up      |
| CHDW    | Channel Down    |


#### The following commands are not implemented yet.

| Command | Description     |
| ------- | -------------   |
| ACSU    | Surround
| WIDE    | Widescreen Mode |
| OFTM    | Off Timer       |
| DCCH    | Change Channel  |
