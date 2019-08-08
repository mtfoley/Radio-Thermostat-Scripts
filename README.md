# Radio-Thermostat-Scripts
Various Scripts Dealing with Radio Thermostat Models (e.g. CT50)

These are a few simple script files that interact with aspects of the API found on thermostats made by Radio Thermostat Company of America (RTCOA). I originally installed one of these in my in-laws' summer home because it had an away mode, but I was pretty delighted to find that it has a local API.

## Links:
- There is a summary and documentation download for the API here: [https://radiothermostat.desk.com/customer/en/portal/articles/1268461-where-do-i-find-information-about-the-wifi-api-]
- Two of the files are meant to scan for existing thermostat devices on a local WiFi network. This discovery protocol uses a very similar pattern to UPnP. The PDF linked above talks about that toward the end.
  - One file (rtcoa.fan) is written in Fantom (https://fantom.org), a Java-like language I sometimes use at work.
  - The other (RadioThermostatScanner.js) is meant to run in a NodeJS environment.
- The other file (RadioThermostatAgent.js) is also meant for NodeJS, and just reads out the /tstat endpoint on the thermostats which read out in the format

## Usage & Screenshots:
Screenshot of rtcoa.fan usage:

![rtcoa.fan usage](https://github.com/mtfoley/Radio-Thermostat-Scripts/raw/master/fantom_discover.png)

Screenshot of /tstat response:

![/tstat response](https://github.com/mtfoley/Radio-Thermostat-Scripts/raw/master/tstat_response.png)
