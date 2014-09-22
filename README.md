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
![Screenshot](https://raw.githubusercontent.com/chilipeppr/LaserSolder/master/arduino/screenshot.png "Screenshot")

Just use a standard Arduino and upload the code contained in this repository. Modify as you like. You'll be running your Arduino on the same computer as your CNC machine so you can bind to both the serial port of your CNC controller like a TinyG as well as bind to your Arduino via its serial port.

The Arduino controls a laser by toggling PIN 12 on and off. You need
to connect a solid state relay, regular relay, or toggle a TTL signal
on a bench power supply. Or you can use something like a FlexMod P3
to toggle the laser on/off.

The laser used is a 3W 445nm Blue Diode laser in a standard 9mm casing
with a heatsink. You can find the laser at https://sites.google.com/site/dtrlpf/home/diodes/9mm-445nm

The Melexis MLX90614 is used for infrared temperature sensing. You
should get the 5 degree FOV version which is around $48. The link to this sensor is http://www.digikey.com/product-detail/en/MLX90614ESF-BCI-000-TU/MLX90614ESF-BCI-000-TU-ND/2666249


Eagle Schematics
----------
![Screenshot](https://raw.githubusercontent.com/chilipeppr/LaserSolder/master/eagle/screenshot.png "Screenshot")

The Eagle design is in the eagle folder of this repository. It's simply a breakout board for the Melexis MLX90614 so you can connect it to your Arduino. It has two LEDs to indicate laser on/off status and power to the Melexis. There is a cutout on the board so you can bolt it to the design of the holder that is described below.

Freecad Design
----------
![Screenshot](https://raw.githubusercontent.com/chilipeppr/LaserSolder/master/freecad/screenshot.png "Screenshot")

The design of the holder for the laser, Melexis MLX90614, the breakout board, and USB Microscope is in the freecad folder in this repo. Freecad is a great tool for basic CAD design. The CAD design was exported to DXF's and then brought into CamBam to generate the acrylic milling operations. The acrylic was then super glued or bolted together. Several M3 an M4 taps were created in the acrylic to enable bolting.

The back holder mounts to the standard Shapeoko mounts for a spindle so you can adjust the height of the laser holder on your Shapeoko.
