import { Page } from "puppeteer";
import extendedGotoPage from "../lib/extendedGotoPage";
import interceptPage from "../lib/interceptPage";
import savePage from "../lib/savePage";

const scrape = async ({
  page,
  data: { url, actions = [] },
}: {
  page: Page;
  data: any;
}) => {
  console.log("going to url", url, " ");
  const { hostname, pathname } = new URL(url);

  await interceptPage(page);
  if (process.env.USE_PROXY === "true")
    await page.authenticate({
      username: process.env.PROXY_KEY,
      password: "",
    });

  await extendedGotoPage({ page, url });

  for (let i = 0; i < actions.length; i++) {
    const { selector, type, timeout } = actions[i];
    try {
      switch (type) {
        case "click":
          await page.click(selector);
          await page.waitForTimeout(1000);
          break;
        case "waitForTimeout":
          await page.waitForTimeout(timeout);
        default:
          console.log("unknown action type", type);
          break;
      }
    } catch (e) {
      console.log(`${type} error`, e.message);
    }
  }

  await savePage({
    page,
    dirr: ["sites", hostname, pathname],
    name: "page3",
  });
  return page.content();
};

export default scrape;
