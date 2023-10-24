import time
from secrets import secrets

import adafruit_esp32spi.adafruit_esp32spi_socket as socket
import adafruit_minimqtt.adafruit_minimqtt as MQTT
import board
import displayio
import neopixel
import supervisor
from adafruit_esp32spi import adafruit_esp32spi, adafruit_esp32spi_wifimanager
from adafruit_matrixportal.matrix import Matrix
from adafruit_matrixportal.network import Network
from digitalio import DigitalInOut

MQTT_HOST = 'mhespenh.com'

# Initialize the display
matrix = Matrix()
display = matrix.display
bitmap = displayio.Bitmap(display.width, display.height, 8)
# Create an 8 color palette
palette = displayio.Palette(8)
palette[0] = 0x000000
palette[1] = 0xff0000
palette[2] = 0x00ff00
palette[3] = 0x0000ff
palette[4] = 0xffff00
palette[5] = 0x00ffff
palette[6] = 0xff00ff
palette[7] = 0xffffff

# Create a TileGrid using the Bitmap and Palette
tile_grid = displayio.TileGrid(bitmap, pixel_shader=palette)
# Create a Group
group = displayio.Group()
# Add the TileGrid to the Group
group.append(tile_grid)
# Add the Group to the Display
display.show(group)

# Draw a few pixels
bitmap[0, 0] = 1

# Configure WIFI
spi = board.SPI()
esp32_cs = DigitalInOut(board.ESP_CS)
esp32_ready = DigitalInOut(board.ESP_BUSY)
esp32_reset = DigitalInOut(board.ESP_RESET)
esp = adafruit_esp32spi.ESP_SPIcontrol(spi, esp32_cs, esp32_ready, esp32_reset, debug=False)
status_light = neopixel.NeoPixel(
    board.NEOPIXEL, 1, brightness=0.2
)
wifi = adafruit_esp32spi_wifimanager.ESPSPI_WiFiManager(esp, secrets, status_light)

print("Connecting to Wifi")
bitmap[1, 0] = 1
while not esp.is_connected:
  try:
    bitmap[2, 0] = 1
    wifi.connect()
  except OSError as e:
    bitmap[2, 0] = 0
    print("Unable to connect, trying again")

bitmap[3, 0] = 1
print("IP Address", esp.pretty_ip(esp.ip_address))
print("Server ping", esp.ping(MQTT_HOST), "ms")

# Define callback methods which are called when events occur
# pylint: disable=unused-argument, redefined-outer-name
def connect(client, userdata, flags, rc):
  # This function will be called when the client is connected
  # successfully to the broker.
  print("Connected to MQTT Broker!")
  print("Flags: {0}\n RC: {1}".format(flags, rc))

def disconnect(client, userdata, rc):
  # This method is called when the client disconnects
  # from the broker.
  print("Disconnected from MQTT Broker!")

def subscribe(client, userdata, topic, granted_qos):
  # This method is called when the client subscribes to a new feed.
  print("Subscribed to {0} with QOS level {1}".format(topic, granted_qos))

def unsubscribe(client, userdata, topic, pid):
  # This method is called when the client unsubscribes from a feed.
  print("Unsubscribed from {0} with PID {1}".format(topic, pid))

def publish(client, userdata, topic, pid):
  # This method is called when the client publishes data to a feed.
  print("Published to {0} with PID {1}".format(topic, pid))

def on_set_message(client, topic, message):
  x,y,p = message.split(',')
  bitmap[int(x), int(y)] = int(p)

def on_clear_message(client, topic, message):
  for x in range(matrix.display.width):
    for y in range(matrix.display.height):
        bitmap[x, y] = 0
   
# Initialize MQTT interface with the esp interface
MQTT.set_socket(socket, esp)

# Set up a MiniMQTT Client
client = MQTT.MQTT(
    broker=MQTT_HOST,
    username=secrets["serial"],
    password=secrets["mqtt_pass"],
    client_id="litebyte-" + secrets["serial"],
    keep_alive=60,
)

# Connect callback handlers to client
client.on_connect = connect
client.on_disconnect = disconnect
client.on_subscribe = subscribe
client.on_unsubscribe = unsubscribe
client.on_publish = publish

print("Attempting to connect to %s" % client.broker)
client.will_set(secrets["serial"]+'/status', 'offline', retain=True)
client.connect()

client.publish(secrets["serial"]+'/status', 'online', retain=True)

set_topic = secrets["serial"] + "/display.set"
clear_topic = secrets["serial"] + "/display.clear"
print("Subscribing to %s", set_topic)
client.subscribe(set_topic)
print("Subscribing to %s", clear_topic)
client.subscribe(clear_topic)

client.add_topic_callback(
  secrets["serial"] + "/display.set", on_set_message
)

client.add_topic_callback(
  secrets["serial"] + "/display.clear", on_clear_message
)

while True:
  try:
    client.loop()
  except MQTT.MMQTTException as e:
    print("MQTT Exception: %s" % e)
    pass    
  except (ValueError, RuntimeError) as e:
    print("Failed to get data, retrying\n", e)
    wifi.reset()
    client.reconnect()
    continue
  except:
    supervisor.reload()

  time.sleep(0.01)
