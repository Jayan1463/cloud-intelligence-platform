const si = require("systeminformation");

async function collectMetrics() {

  try {

    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const net = await si.networkStats();

    const cpuUsage = Math.round(cpu.currentLoad);
    const memoryUsage = Math.round((mem.used / mem.total) * 100);
    const networkTraffic = net.length > 0 ? Math.round(net[0].rx_sec / 1000) : 0;

    console.log("CPU:", cpuUsage);
    console.log("Memory:", memoryUsage);
    console.log("Network:", networkTraffic);

  } catch (error) {
    console.error("Error collecting metrics:", error);
  }

}

collectMetrics();