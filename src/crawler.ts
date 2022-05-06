import { getCluster } from "./cluster";
import crawlerProcess from "./businessLogic/crawlerProcess";

const crawl = async ({ id, url, designerVersion }) => {
  const cluster = await getCluster();
  const response = cluster.execute(
    { id, url, designerVersion },
    crawlerProcess
  );
  return response;
};

export { crawl };
