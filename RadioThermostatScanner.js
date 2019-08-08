module.exports = RadioThermostatScanner

const inherits = require("util").inherits
const NetworkScanner = require("./NetworkScanner")
const request = require("request")
const dgram = require("dgram");
const process = require("process");

const NOTIFY_SERVICE = "com.marvell.wm.system:1.0"
const DISCOVERY_MESSAGE = "TYPE: WM-DISCOVER\r\nVERSION: 1.0\r\n\r\nservices: com.marvell.wm.system*\r\n\r\n"
const PORT = 1900;
const MULTICAST_ADDR = "239.255.255.250";

var socket = null

function parseLocation(message){
  let re = /LOCATION: (.*)$/m
  let match = message.match(re)
  if(match[1]) return match[1]//.replace('/sys/','/tstat')
  return false
}
function sendMessage() {
  const message = Buffer.from(DISCOVERY_MESSAGE)
  socket.send(message, 0, message.length, PORT, MULTICAST_ADDR, ()=>{})
}


function RadioThermostatScanner(){
  var self = this
  NetworkScanner.call(this,arguments)
  self.discoveredAddresses = []
  self.discoveredItems = []
  self.on('started',  self.onStart)
  self.on('stopped', self.onStop)
}
inherits(RadioThermostatScanner, NetworkScanner)
RadioThermostatScanner.prototype.onStart = function(){
  var self = this
  self.discoveredAddresses = []
  self.discoveredItems = []
  socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
  socket.bind(PORT);
  socket.on("message", function(messageBuffer, rinfo) {
    let message = messageBuffer.toString()
    if(message.indexOf(NOTIFY_SERVICE) > -1){
      let location = parseLocation(message)
      if(location && !self.discoveredAddresses.includes(location)){
        self.discoveredAddresses.push(location)
        request({url:location,method:"GET"},function(error,response,body){
          let obj = JSON.parse(body)
          obj.addr = location.replace("/sys/","/tstat")
          request({url:location+"name",method:"GET"},function(error,response,body){
            let obj2 = JSON.parse(body)
            if(obj2.name) obj.name = obj2.name
            self.discoveredItems.push(obj)
          })
        })
      }
    }
  });
  socket.on("listening", function() {
    socket.addMembership(MULTICAST_ADDR);
    setTimeout(sendMessage,500)
    const address = socket.address();
  });
}
RadioThermostatScanner.prototype.onStop = function(){
  var self = this
  socket.close()
  socket.removeAllListeners("message")
  socket.removeAllListeners("listening")
  self.emit('results',self.discoveredItems)
}
