module.exports = RadioThermostatAgent
const request = require('request')
const inherits = require("util").inherits
const events = require("events")
const xtend = require("xtend")
const TSTAT_PATH = "/tstat"
function RadioThermostatAgent(name,url,pollInterval){
  this.name = name
  this.url = url
  this.pollInterval = pollInterval
}
inherits(RadioThermostatAgent, events.EventEmitter)
RadioThermostatAgent.prototype.start = function(){
  var agent = this
  agent.timeout = setInterval(function(){agent.read()},agent.pollInterval)
  agent.emit('started')
}
RadioThermostatAgent.prototype.stop = function(){
  var agent = this
  if(agent.timeout) clearInterval(agent.timeout)
  agent.emit('stopped')
}
RadioThermostatAgent.prototype.read = function(callback){
  var agent = this
  if(!callback) callback = function(){}
  const cb = function(error,response,body){
    if(error) return callback(error,null)
    else {
      const obj = JSON.parse(body)
      callback(null,obj)
      agent.emit('data-read',obj)
    }
  }
  request.get({
    url:agent.url+TSTAT_PATH,
  },cb)
}
