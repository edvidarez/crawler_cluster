import { sites } from "../data/sites.json";
import { designerVersions } from "../data/designerVersions.json";
import crawl from "./crawler";
import { getCluster } from "./cluster";

const process = async () => {
  console.log(sites.length);
  console.log(designerVersions.length);
  const frazerDesignerVersions = designerVersions
    .filter((dv) => {
      return dv.designerId === 4;
    })
    .map((dv) => dv.id);
  console.log("frazerDesignerVersions", frazerDesignerVersions);
  const frazerSites = sites.filter((site) => {
    return frazerDesignerVersions.includes(site.designerVersionId);
  });
  console.log(
    "frazerSites",
    frazerSites.length,
    frazerSites.slice(0, 10),
    JSON.stringify(frazerSites.slice(0, 10), null, 2)
  );
  frazerSites.map((site) => {
    crawl(site);
  });
  const cluster = await getCluster();
  await cluster.idle();
  await cluster.close();
};
process();
export default process;
