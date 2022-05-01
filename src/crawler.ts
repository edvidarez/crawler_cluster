import { getCluster } from "./cluster";

const crawl = async ({ url }: { url: string }): Promise<void> => {
  const cluster = await getCluster();

  // Queue any number of tasks
  cluster.queue(url);
};

// crawl({ url: "https://vanessagomezfancy.com" });
export default crawl;
