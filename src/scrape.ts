import { getCluster } from "./cluster";
import scrapeProcess from "./businessLogic/scrapeProcess";

const scrape = async ({ id, url, actions }) => {
  const cluster = await getCluster();
  const response = await cluster.execute({ id, url, actions }, scrapeProcess);
  return response;
};

export { scrape };
