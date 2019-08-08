using util
using inet
using web
class RTCOA : AbstractMain {
	private MulticastSocket? socket := null
	private IpInterface? iface := null
	private WebClient? client := null
	private IpAddr? ipAddr := null
	private Str[] addresses := [,]
	private Str interfaceName := "en1"
	private const IpAddr? discAddr := IpAddr.make("239.255.255.250")
	private const Int ssdpPort := 1900
	private const Str discMsg := "TYPE: WM-DISCOVER\r\nVERSION: 1.0\r\n\r\nservices: com.marvell.wm.system*\r\n\r\n"
	private const Str namePath := "/sys/name"
	private const Str tstatPath := "/tstat"
	private const Regex locRegex := "LOCATION: (.*)/sys/".toRegex()
	private const Duration timeout := Duration.fromStr("10sec")
	private IpInterface getInterface() {
		return IpInterface.findByName(interfaceName)
	}
	private IpAddr getIpAddr(IpInterface iface) {
		return iface.addrs().find( |IpAddr addr->Bool|{ addr.isIPv4 })
	}
	private Void setupDiscoverySocket(IpAddr ipAddr,IpAddr discAddr) {
		socket = MulticastSocket.make()
		socket.options.broadcast = true
		socket.options.reuseAddr = true
		socket.options.receiveTimeout = timeout
		socket.bind(ipAddr,ssdpPort)
		socket.joinGroup(discAddr)
	}
	private Void sendDiscovery() {
		Buf buf := Buf.make(4096).writeChars(discMsg).flip
		UdpPacket pack := UdpPacket.make(discAddr,ssdpPort,buf)
		socket.send(pack)
	}
	private Void acceptNotification() {
		ret := socket.receive(UdpPacket.make(null,null,Buf.make(4096)))
		addr := parseUri(ret.data.flip.readAllStr)
		echo("Thermostat Found at "+addr)
		addresses.add(addr)

	}
	private Str? parseUri(Str notifyStr) {
		matcher := locRegex.matcher(notifyStr)
		matcher.find()
		return matcher.group(1)

	}
	private Str getStatName(Str baseUri) {
		client = WebClient.make(Uri.fromStr(baseUri+namePath))
		json := client.getStr
		Str:Obj? data := JsonInStream(json.in).readJson
		return data["name"]
	}
	private Obj? getStatTemp(Str baseUri) {
		client = WebClient.make(Uri.fromStr(baseUri+tstatPath))
		json := client.getStr
		Str:Obj? data := JsonInStream(json.in).readJson
		return data["temp"]
	}
	public override Int run()
	{
		iface = getInterface()
		ipAddr = getIpAddr(iface)
		if(iface.supportsMulticast){
			setupDiscoverySocket(ipAddr,discAddr)
			sendDiscovery()
			while(true){
				try{
					acceptNotification()
				} catch(Err e){
					break;
				}
			}
			if(addresses.size > 0){
				addresses.each( |Str addr|{
					name := getStatName(addr)
					temp := getStatTemp(addr)
					echo(name + ": "+ temp + " deg F")
				})
			}
		}
		return 0
	}
}
