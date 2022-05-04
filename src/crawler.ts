import { getCluster } from "./cluster";

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

const crawl = async ({ url }) => {
  const cluster = await getCluster();
  const response = cluster.execute(url);
  return response;
};

export { addToQueue, crawl };
