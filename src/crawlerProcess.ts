import path from "path";
import fs from "fs";
import { getCluster } from "./cluster";
import scrape from "./scrape";
import { stats } from "./stats";

const crawlerProcess = async ({ page, data: { id, url, designerVersion } }) => {
  console.log("designerVersion", designerVersion.id);
  console.log("going to url", url, " ");
  // await page.setRequestInterception(true);
  /* page.on("request", (req) => {
      if (
        req.resourceType() === "image" ||
        req.resourceType() === "stylesheet"
      ) {
        return req.abort();
      } else {
        return req.continue();
      }
    }); */
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    // disable webpack HMR, which breaks the 'networkidle0' setting
    if (req.url().endsWith("/__webpack_hmr")) {
      req.abort();
    } else {
      req.continue();
    }
  });
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
  } catch (e) {
    console.log("error", e);
  }
  // await page.waitForTimeout(5000);
  const { hostname } = new URL(url);
  const today = new Date();
  const dateStr = `${today.getFullYear()}_${today.getMonth()}_${
    today.getDay() + 1
  } ${today.getHours()}:${today.getMinutes()}`;
  console.log(
    "creating directory",
    `${path.join(__dirname, "sites", hostname)}`
  );
  if (!fs.existsSync(path.join("sites", hostname)))
    fs.mkdirSync(path.join("sites", hostname));
  const hostKey = `${hostname}_${dateStr}.png`;
  console.log("Key:hostKey,", hostKey);
  const base64 = await page.screenshot({
    path: path.join("sites", hostname, "home-" + dateStr + ".png"),
    fullPage: true,
  });

  const html = await page.content();
  // write html to the same directory
  fs.writeFileSync(
    path.join("sites", hostname, "home-" + dateStr + ".html"),
    html
  );
  const listingUrl = url + designerVersion.urlListingSuffix.value;
  try {
    await page.goto(listingUrl, { waitUntil: "networkidle2" });
  } catch (e) {
    console.log("error", e);
  }
  const listingHtml = await page.content();

  const links = [];
  for (let i = 0; i < 1; i++) {
    try {
      fs.writeFileSync(
        path.join("sites", hostname, "page" + i + "-" + dateStr + ".html"),
        listingHtml
      );
      const container = await page.$(
        designerVersion.listingPageSelectors.listContainerSelector
      );
      const items = await container.$$(
        designerVersion.listingPageSelectors.listItemSelector
      );
      await Promise.all(
        items.map(async (item) => {
          const linkElement = await item.$(
            designerVersion.listingPageSelectors.linkSelector
          );
          const link = await linkElement.getProperty("href");
          const linkValue = await link.jsonValue();
          links.push(linkValue);
        })
      );
    } catch (e) {
      console.log("error", e);
    }
    /*  try {
        if (i == 0) {
          await page.click(
            designerVersion.listingPageSelectors.nextPageButtonSelector
          );
          await page.waitForNavigation({
            timeout: 30000,
            waitUntil: "networkidle2",
          });
        }
      } catch (e) {
        console.log("error paginating", e);
      }*/
  }
  fs.writeFileSync(
    path.join("sites", hostname, "links" + dateStr + ".json"),
    JSON.stringify(links, null, 2)
  );
  const cluster = await getCluster();
  links.map((link) => {
    cluster.queue({ url: link, designerVersion }, scrape);
  });
  //   stats["linksCrawled"] = stats["linksCrawled"]
  //     ? stats["linksCrawled"].push({ id, links: links.length })
  //     : [{ id, links: links.length }];

  return;
  /* try {
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
    } */
};

export default crawlerProcess;
