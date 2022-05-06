import vanillaPuppeteer from "puppeteer";
import { addExtra } from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { Cluster } from "puppeteer-cluster";
import BrowserProxy from "./lib/BrowserProxy";

// @ts-ignore
const puppeteer = addExtra(vanillaPuppeteer);
let cluster: Cluster;

// Puppeteer plugins
puppeteer.use(StealthPlugin());

const puppeteerArgs = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--ignore-certificate-errors",
  "--enable-features=NetworkService",
];
if (process.env.USE_PROXY === "true") {
  console.log("using proxy");
  puppeteerArgs.push(`--proxy-server=${process.env.PROXY_HOST}`);
}

const initCluster = async () => {
  console.log("initializing cluster");

  cluster = await Cluster.launch({
    concurrency: BrowserProxy,
    maxConcurrency: Number(process.env.CLUSTER_MAX_CONCURRENCY) || 32,
    workerCreationDelay: 5000,
    retryLimit: 2,
    retryDelay: 15000,
    puppeteerOptions: {
      args: puppeteerArgs,
      headless: process.env.CLUSTER_HEADLESS === "true",
      ignoreHTTPSErrors: true,
      defaultViewport: { height: 720, width: 1280 },
    },
    monitor: process.env.CLUSTER_MONITOR === "true",
    puppeteer,
    sameDomainDelay: Number(process.env.CLUSTER_SAME_DOMAIN_DELAY) || 1000,
    timeout: Number(process.env.CLUSTER_TIMEOUT) || 120000,
  });

  cluster.on("taskerror", (err, data, willRetry) => {
    if (willRetry) {
      console.warn(
        `Warn ===> Encountered an error while crawling ${data.url}. ${err.message}\nThis job will be retried\n`
      );
    } else {
      console.error(`Error ===> Failed to crawl ${data.url}: ${err.message}`);
    }
  });
};

const getCluster = async () => {
  if (!cluster) {
    await initCluster();
  }
  return cluster;
};

export { initCluster, getCluster };
