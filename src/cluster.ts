import { v4 } from "uuid";
import AWS from "aws-sdk";
import vanillaPuppeteer from "puppeteer";
import { addExtra } from "puppeteer-extra";
AWS.config.update({ region: "us-east-1" });
import StealthPlugin from "puppeteer-extra-plugin-stealth";
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const adblocker = AdblockerPlugin({
  blockTrackers: true, // default: false
});

import { Cluster } from "puppeteer-cluster";

// @ts-ignore
const puppeteer = addExtra(vanillaPuppeteer);
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
    maxConcurrency: 2,
    workerCreationDelay: 5000,
    retryLimit: 2,
    retryDelay: 5000,
    puppeteerOptions: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
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
    console.log("going to url", url, " ");
    await page.goto(url, { timeout: 120000, waitUntil: "networkidle2" });
    const { hostname } = new URL(url);
    const today = new Date();
    const dateStr = `${today.getFullYear()}_${today.getMonth()}_${
      today.getDay() + 1
    } ${today.getHours()}:${today.getMinutes()}`;
    const hostKey = `${hostname}_${dateStr}.png`;
    console.log("Key:hostKey,", hostKey);
    const base64 = await page.screenshot({
      fullPage: true,
    });
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: "screenshots-adn",
        Key: hostKey,
        Body: base64 || "",
      };
      const s3 = new AWS.S3();
      await s3.upload(params).promise();
      console.log("file_uploaded");
    } catch (err) {
      console.log("error uploading to s3", err.message);
    }
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
