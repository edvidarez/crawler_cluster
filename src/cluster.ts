import path from "path";
import fs from "fs";
import AWS from "aws-sdk";
import vanillaPuppeteer from "puppeteer";
import { addExtra } from "puppeteer-extra";
AWS.config.update({ region: "us-east-1" });
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import Adblocker from "puppeteer-extra-plugin-adblocker";
import AnonymizeUA from "puppeteer-extra-plugin-anonymize-ua";
import BlockResources from "puppeteer-extra-plugin-block-resources";

import { Cluster } from "puppeteer-cluster";
import { stats } from "./stats";

// @ts-ignore
const puppeteer = addExtra(vanillaPuppeteer);

/* puppeteer.use(
  BlockResources({
    blockedTypes: new Set(["image"]),
  })
);


*/
/* puppeteer.use(
  AnonymizeUA({
    // customFn: (ua: string) => "MyCoolAgent/" + ua.replace("Chrome", "Beer"),
  })
); */
puppeteer.use(StealthPlugin());
/* puppeteer.use(
  Adblocker({
    blockTrackers: true,
  })
); */
let cluster: Cluster;

const initCluster = async () => {
  console.log(
    "initializing cluster with concurrency:",
    Cluster.CONCURRENCY_CONTEXT
  );
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 8,
    workerCreationDelay: 10000,
    retryLimit: 1,
    retryDelay: 5000,
    puppeteerOptions: {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--enable-features=NetworkService",
      ],
      headless: true,
      ignoreHTTPSErrors: true,
    },
    monitor: true,
    puppeteer,
    sameDomainDelay: 5000,
    timeout: 30000,
  });
  cluster.on("taskerror", (err, data, willRetry) => {
    // stats["errorCrawling"] = stats["errorCrawling"]
    //   ? stats["errorCrawling"].push({ data })
    //   : [{ data }];
    // stats["errorCrawling"] = [...stats["errorCrawling"], { data }];

    if (willRetry) {
      console.warn(
        `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`
      );
    } else {
      console.error(`Failed to crawl ${data}: ${err.message}`);
    }
  });
  // await cluster.task(async ({ page, data: { url, designerVersion } }) => {
  //   console.log("designerVersion", designerVersion.id);
  //   console.log("going to url", url, " ");
  //   // await page.setRequestInterception(true);
  //   /* page.on("request", (req) => {
  //     if (
  //       req.resourceType() === "image" ||
  //       req.resourceType() === "stylesheet"
  //     ) {
  //       return req.abort();
  //     } else {
  //       return req.continue();
  //     }
  //   }); */
  //   await page.setRequestInterception(true);

  //   page.on("request", (req) => {
  //     // disable webpack HMR, which breaks the 'networkidle0' setting
  //     if (req.url().endsWith("/__webpack_hmr")) {
  //       req.abort();
  //     } else {
  //       req.continue();
  //     }
  //   });
  //   try {
  //     await page.goto(url, { waitUntil: "networkidle2" });
  //   } catch (e) {
  //     console.log("error", e);
  //   }
  //   // await page.waitForTimeout(5000);
  //   const { hostname } = new URL(url);
  //   const today = new Date();
  //   const dateStr = `${today.getFullYear()}_${today.getMonth()}_${
  //     today.getDay() + 1
  //   } ${today.getHours()}:${today.getMinutes()}`;
  //   console.log(
  //     "creating directory",
  //     `${path.join(__dirname, "sites", hostname)}`
  //   );
  //   if (!fs.existsSync(path.join("sites", hostname)))
  //     fs.mkdirSync(path.join("sites", hostname));
  //   const hostKey = `${hostname}_${dateStr}.png`;
  //   console.log("Key:hostKey,", hostKey);
  //   const base64 = await page.screenshot({
  //     path: path.join("sites", hostname, "home-" + dateStr + ".png"),
  //     fullPage: true,
  //   });

  //   const html = await page.content();
  //   // write html to the same directory
  //   fs.writeFileSync(
  //     path.join("sites", hostname, "home-" + dateStr + ".html"),
  //     html
  //   );
  //   const listingUrl = url + designerVersion.urlListingSuffix.value;
  //   try {
  //     await page.goto(listingUrl, { waitUntil: "networkidle2" });
  //   } catch (e) {
  //     console.log("error", e);
  //   }
  //   const listingHtml = await page.content();

  //   const links = [];
  //   for (let i = 0; i < 1; i++) {
  //     try {
  //       fs.writeFileSync(
  //         path.join("sites", hostname, "page" + i + "-" + dateStr + ".html"),
  //         listingHtml
  //       );
  //       const container = await page.$(
  //         designerVersion.listingPageSelectors.listContainerSelector
  //       );
  //       const items = await container.$$(
  //         designerVersion.listingPageSelectors.listItemSelector
  //       );
  //       await Promise.all(
  //         items.map(async (item) => {
  //           const linkElement = await item.$(
  //             designerVersion.listingPageSelectors.linkSelector
  //           );
  //           const link = await linkElement.getProperty("href");
  //           const linkValue = await link.jsonValue();
  //           links.push(linkValue);
  //         })
  //       );
  //     } catch (e) {
  //       console.log("error", e);
  //     }
  //     /*  try {
  //       if (i == 0) {
  //         await page.click(
  //           designerVersion.listingPageSelectors.nextPageButtonSelector
  //         );
  //         await page.waitForNavigation({
  //           timeout: 30000,
  //           waitUntil: "networkidle2",
  //         });
  //       }
  //     } catch (e) {
  //       console.log("error paginating", e);
  //     }*/
  //   }
  //   fs.writeFileSync(
  //     path.join("sites", hostname, "links" + dateStr + ".json"),
  //     JSON.stringify(links, null, 2)
  //   );
  //   return;
  //   /* try {
  //     const params: AWS.S3.PutObjectRequest = {
  //       Bucket: "screenshots-adn",
  //       Key: hostKey,
  //       Body: base64 || "",
  //     };
  //     const s3 = new AWS.S3();
  //     await s3.upload(params).promise();
  //     console.log("file_uploaded");
  //   } catch (err) {
  //     console.log("error uploading to s3", err.message);
  //   } */
  // });

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
