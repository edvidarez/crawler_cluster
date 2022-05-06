import { sites } from "../data/sites.json";
import { designerVersions } from "../data/designerVersions.json";
import { crawl } from "./crawler";
import { getCluster } from "./cluster";

const process = async () => {
  const frazerDesignerVersions = designerVersions.filter((dv) => {
    return dv.designerId === 4;
  });
  const frazerIds = frazerDesignerVersions.map((dv) => dv.id);

  const frazerSites = sites
    .filter((site) => {
      return frazerIds.includes(site.designerVersionId);
    })
    .map((site) => {
      return {
        ...site,
        designerVersion: frazerDesignerVersions.find(
          (dv) => dv.id === site.designerVersionId
        ),
      };
    });
  const cluster = await getCluster();

  for (let i = 1; i < frazerSites.length; i++) {
    const site = frazerSites[i];
    crawl(site);
    break;
  }

  await cluster.idle();
  await cluster.close();
};
process();
export default process;
