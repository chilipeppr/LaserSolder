LaserSolder
===========

The laser solderer widget for ChiliPeppr that uses an Arduino to control a laser with an infrared heat sensor and a PID to ensure accurate soldering.

ChiliPeppr Widget
-----------
![Screenshot](https://raw.githubusercontent.com/chilipeppr/LaserSolder/master/chilipeppr_widget/screenshot.png "Screenshot")

The widget lets you set at which Z height the laser will turn on. The laser is toggled from a normal Arduino. The command "laser-on" or "laser-off" is sent to the Arduino to toggle. You must also pick which port the Arduino is on. The Arduino also reports back every 500ms what the temperature of the Melexis infrared heat sensor readings are as a JSON string in the format {"a":27.54, "o":31.34} where "a" is the ambient temperature and "o" is the object's temperature in degrees Celsius. You can also toggle the laser manually.

![Screenshot](https://raw.githubusercontent.com/chilipeppr/LaserSolder/master/chilipeppr_widget/screenshot_laseron.png "Screenshot")

When the laser is on the widget goes red to indicate the state. You can always manually turn the laser off to override the auto-toggling based on the Z axis position.

Arduino Code
----------

Eagle Schematics
----------

Freecad Design
----------

