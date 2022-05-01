import chromium from "chrome-aws-lambda";
import { addExtra } from "puppeteer-extra";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const adblocker = AdblockerPlugin({
  blockTrackers: true, // default: false
});

import { Cluster } from "puppeteer-cluster";

// @ts-ignore
const puppeteer = addExtra(chromium.puppeteer);
puppeteer.use(StealthPlugin());
puppeteer.use(
  require("puppeteer-extra-plugin-anonymize-ua")({
    customFn: (ua: string) => "MyCoolAgent/" + ua.replace("Chrome", "Beer"),
  })
);
puppeteer.use(AdblockerPlugin());
let cluster: Cluster;

const initCluster = async () => {
  console.log(
    "initializing cluster with concurrency:",
    Cluster.CONCURRENCY_CONTEXT
  );
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 8,
    workerCreationDelay: 5000,
    retryLimit: 2,
    retryDelay: 5000,
    puppeteerOptions: {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    },
    monitor: true,
    puppeteer,
    sameDomainDelay: 15000,
    timeout: 120000,
  });
  cluster.on("taskerror", (err, data, willRetry) => {
    if (willRetry) {
      console.warn(
        `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`
      );
    } else {
      console.error(`Failed to crawl ${data}: ${err.message}`);
    }
  });
  await cluster.task(async ({ page, data: url }) => {
    console.log("going to url", url);
    await page.goto(url, { timeout: 120000 });
    const { hostname } = new URL(url);
    await page.screenshot({ path: `${hostname}.png`, fullPage: true });
    return 1;
  });

  // // when idle close the browser
  // cluster.idle().then(async () => {
  //   console.log("closing cluster");
  //   await cluster.close();
  // });
};

const getCluster = async () => {
  if (!cluster) {
    await initCluster();
  }
  return cluster;
};

export { initCluster, getCluster };
