/* eslint-disable @typescript-eslint/no-require-imports */
const si = require("systeminformation");
const { initializeApp } = require("firebase/app");
const { 
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBt4dmjsZifOgkI6e-uXzKa6w88Yd5kQmE",
  authDomain: "cloud-intelligence-platform.firebaseapp.com",
  projectId: "cloud-intelligence-platform",
  storageBucket: "cloud-intelligence-platform.firebasestorage.app",
  messagingSenderId: "125321296659",
  appId: "1:125321296659:web:ecfdba1980d9911f3ff8e6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const METRIC_LIMIT = 200;

async function cleanupOldMetrics() {

  const metricsRef = collection(db, "metrics");

  const snapshot = await getDocs(
    query(metricsRef, orderBy("timestamp", "desc"))
  );

  const docs = snapshot.docs;

  if (docs.length > METRIC_LIMIT) {

    const docsToDelete = docs.slice(METRIC_LIMIT);

    for (const d of docsToDelete) {
      await deleteDoc(doc(db, "metrics", d.id));
    }

    console.log("Old metrics cleaned:", docsToDelete.length);
  }

}

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

    await addDoc(collection(db, "metrics"), {
      cpu: cpuUsage,
      memory: memoryUsage,
      network: networkTraffic,
      timestamp: new Date()
    });

    console.log("Metric saved");

    await cleanupOldMetrics();

  } catch (error) {
    console.error("Collector error:", error);
  }

}

async function startCollector() {

  while (true) {

    await collectMetrics();

    await new Promise(resolve => setTimeout(resolve, 30000));

  }

}

startCollector();