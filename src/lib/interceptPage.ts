import path from "path";
import fs from "fs";
import { Page } from "puppeteer";
// import useProxy from "puppeteer-page-proxy";

const blockList = [
  "www.google-analytics.com",
  "www.gstatic.com",
  "www.google.com",
  "www.googletagmanager.com",
  "connect.facebook.net",
  "ajax.googleapis.com",
  "www.googleoptimize.com",
];

const interceptPage = async (page: Page) => {
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (req.resourceType() === "image") {
      return req.respond({
        contentType: "image/png",
        body: fs.readFileSync(
          path.join(__dirname, "..", "..", "data", "image.png")
        ),
      });
    }
    if (req.resourceType() === "font" || blockList.includes(url.hostname)) {
      return req.abort();
    }

    return req.continue();
  });
};
export default interceptPage;
