import { getCluster } from "../cluster";
import scrape from "./scrapeProcess";
import interceptPage from "../lib/interceptPage";
import extendedGotoPage from "../lib/extendedGotoPage";

const crawlerProcess = async ({ page, data: { url, designerVersion } }) => {
  console.log("going to url", url, " ");
  if (process.env.USE_PROXY === "true")
    await page.authenticate({
      username: process.env.PROXY_KEY,
      password: "",
    });
  await interceptPage(page);
  await extendedGotoPage({ page, url });

  const { hostname } = new URL(url);

  const listingUrl = url + designerVersion.urlListingSuffix.value;
  await extendedGotoPage({ page, url: listingUrl });

  const links = [];
  for (let i = 0; i < 1; i++) {
    try {
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
          try {
            const link = await linkElement.getProperty("href");
            const linkValue = await link.jsonValue();
            links.push(linkValue);
          } catch (e) {}
        })
      );
    } catch (e) {
      console.log("Error 3 paginating", hostname, e);
    }
  }
  const cluster = await getCluster();
  links.map((link) => {
    cluster.queue({ url: link, designerVersion }, scrape);
  });

  return links;
};

export default crawlerProcess;
