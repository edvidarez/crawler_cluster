import * as puppeteer from "puppeteer";

import { debugGenerator, timeoutExecute } from "puppeteer-cluster/dist/util";
import ConcurrencyImplementation, {
  WorkerInstance,
} from "puppeteer-cluster/dist/concurrency/ConcurrencyImplementation";
const debug = debugGenerator("BrowserConcurrency");

const BROWSER_TIMEOUT = 5000;

export default class BrowserProxy extends ConcurrencyImplementation {
  public async init() {}
  public async close() {}

  public async workerInstance(
    perBrowserOptions: puppeteer.LaunchOptions | undefined
  ): Promise<WorkerInstance> {
    const options = perBrowserOptions || this.options;
    let chrome = (await this.puppeteer.launch(options)) as puppeteer.Browser;
    let page: puppeteer.Page;
    let context: any;

    return {
      jobInstance: async () => {
        const proxyServer =
          chrome
            .process()
            ?.spawnargs.find((it) => it.startsWith("--proxy-server"))
            ?.split("=")[1] || undefined;
        await timeoutExecute(
          BROWSER_TIMEOUT,
          (async () => {
            context = await chrome.createIncognitoBrowserContext({
              proxyServer,
            });
            page = await context.newPage();
          })()
        );

        return {
          resources: {
            page,
          },

          close: async () => {
            await timeoutExecute(BROWSER_TIMEOUT, context.close());
          },
        };
      },

      close: async () => {
        await chrome.close();
      },

      repair: async () => {
        debug("Starting repair");
        try {
          await chrome.close();
        } catch (e) {}
        chrome = await this.puppeteer.launch(options);
      },
    };
  }
}
