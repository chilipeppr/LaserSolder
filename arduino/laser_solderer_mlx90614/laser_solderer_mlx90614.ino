/*
ChiliPeppr Laser Solderer Arduino Code

This file controls a laser by toggling PIN 12 on and off. You need
to connect a solid state relay, regular relay, or toggle a TTL signal
on a bench power supply. Or you can use something like a FlexMod P3
to toggle the laser on/off.

The laser used is a 452nm Blue Diode laser in a standard 9mm casing
with a heatsink.

The Melexis MLX90614 is used for infrared temperature sensing. You
should get the 5 degree FOV version which is around $35.
*/

/*************************************************** 
  This is a library example for the MLX90614 Temp Sensor

  Designed specifically to work with the MLX90614 sensors in the
  adafruit shop
  ----> https://www.adafruit.com/products/1748
  ----> https://www.adafruit.com/products/1749

  These sensors use I2C to communicate, 2 pins are required to  
  interface
  Adafruit invests time and resources providing this open source code, 
  please support Adafruit and open-source hardware by purchasing 
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.  
  BSD license, all text above must be included in any redistribution
 ****************************************************/

#include <Wire.h>
#include <Adafruit_MLX90614.h>

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

// Pin 13 has an LED connected on most Arduino boards.
// give it a name:
int led = 13;
boolean ledOn = false;

// Laser switch
int laser = 12;

String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete

int WindowSize = 1000;  // how often to send temp report
unsigned long windowStartTime;

void setup() {
  
  // init laser to off
  pinMode(laser, OUTPUT);
  digitalWrite(laser, HIGH);
  
  Serial.begin(9600);

  // initialize the digital pin as an output.
  pinMode(led, OUTPUT);     
  digitalWrite(led, HIGH);
  
  windowStartTime = millis();
  
  // reserve 200 bytes for the inputString:
  inputString.reserve(200);
  
  // leonardo
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }
  
  mlx.begin();  
  
  Serial.println("ChiliPeppr Laser Solderer MLX90614");  

}

void loop() {
  
  // print the string when a newline arrives:
  if (stringComplete) {
    //Serial.println(inputString); 
    
    if (inputString == "laser-on") {
      laserOn();
    } else if (inputString == "laser-off") {
      laserOff();
    } else if (inputString == "?") {
      Serial.println("ChiliPeppr Laser Control via Arduino");
      Serial.println("Commands:");
      Serial.println("laser-on\tTurn Laser On");
      Serial.println("laser-off\tTurn Laser Off");
    } else {
      Serial.println("Did not understand command: " + inputString);
    }
    
    // clear the string:
    inputString = "";
    stringComplete = false;
  }
  
  if(Serial.available() > 0)
   serialEvent();
   
  //ledOn = !ledOn;
  //if (ledOn) digitalWrite(led, HIGH);
  //else digitalWrite(led, LOW);
  
  if (millis() - windowStartTime >= WindowSize) { 
    // send report
    
    // reset the windowStartTime
    windowStartTime += WindowSize;
    Serial.print("{\"a\":"); 
    Serial.print(mlx.readAmbientTempC()); 
    Serial.print(", \"o\":"); 
    Serial.print(mlx.readObjectTempC()); 
    Serial.println("}");
    //Serial.print("Ambient = "); Serial.print(mlx.readAmbientTempF()); 
    //Serial.print("*F\tObject = "); Serial.print(mlx.readObjectTempF()); Serial.println("*F");
  
    //Serial.println();
  }
  //delay(500);
}

void laserOn() {
  digitalWrite(led, LOW);   // turn the LED on (HIGH is the voltage level)
  digitalWrite(laser, LOW);
  Serial.println("Laser On");
}

void laserOff() {
  digitalWrite(led, HIGH);   // turn the LED on (HIGH is the voltage level)
  digitalWrite(laser, HIGH);
  Serial.println("Laser Off");
}

/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read(); 
    
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inChar == '\n') {
      stringComplete = true;
    } else {
      // add it to the inputString:
      inputString += inChar;
    }
  }
}
