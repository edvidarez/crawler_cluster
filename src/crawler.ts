import { getCluster } from "./cluster";
import crawlerProcess from "./crawlerProcess";
import { stats } from "./stats";

const addToQueue = async ({
  url,
}: {
  id?: number;
  designerVersionId?: number;
  url: string;
}): Promise<void> => {
  const cluster = await getCluster();
  // Queue any number of tasks
  cluster.queue(url);
};

const crawl = async ({ id, url, designerVersion }) => {
  const cluster = await getCluster();
  // stats["sitesCrawled"] = stats["sitesCrawled"]
  //   ? stats["sitesCrawled"].push(id)
  //   : [id];
  cluster.queue({ id, url, designerVersion }, crawlerProcess);
  return;
};

export { addToQueue, crawl };
