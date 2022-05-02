import { getCluster } from "./cluster";

const crawl = async ({
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

export default crawl;
