// Arduino code for example Arduino BLE Beacon.
// Evothings AB, 2014

// Include BLE files.
#include <SPI.h>

// This function is called only once, at reset.
void setup() {
  
    // Enable wake on connection
    // The Loop runs once at initialization.
    // When a client connects, the bean wakes up and loops again.
    // The loop will continue to run as long as a client is connected.
    Bean.enableWakeOnConnect(true);
    
    // Enable serial debug.
    Serial.begin(9600);
    Serial.println("Arduino Beacon example started");
    Serial.println("Serial rate set to 9600");

    // Set a custom BLE name for the beacon.
    // Note that each Arduino should be given a unique name!
    Bean.setBeanName("B2");

    Serial.println("Beacon activated");
}

// This function is called continuously, after setup() completes.
void loop() {

  // Check if client has disconnected
  bool connected = Bean.getConnectionState();

  if (connected){
    // When a client is connected, set the LED to green
    Bean.setLed(0, 255, 0);
  }
  else {
    // Client is disconnected, turn off the LED
    Bean.setLed(0, 0, 0);
    // Sleep for a LONG time to conserve power until another client connects
    // 0xFFFFFFFF = 49 days
    Bean.sleep(0xFFFFFFFF);
  }
}
