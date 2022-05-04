import { sites } from "../data/sites.json";
import { designerVersions } from "../data/designerVersions.json";
import { crawl } from "./crawler";
import { getCluster } from "./cluster";
import { stats } from "./stats";

const process = async () => {
  // console.log(sites.length);
  // console.log(designerVersions.length);

  const frazerDesignerVersions = designerVersions.filter((dv) => {
    return dv.designerId === 4;
  });
  const frazerIds = frazerDesignerVersions.map((dv) => dv.id);
  // console.log("frazerDesignerVersions", frazerDesignerVersions);
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
  // console.log(
  //   "frazerSites",
  //   frazerSites.length,
  //   frazerSites.slice(0, 10),
  //   JSON.stringify(frazerSites.slice(0, 10), null, 2)
  // );
  const cluster = await getCluster();
  for (let i = 1; i < frazerSites.length; i++) {
    const site = frazerSites[i];
    crawl(site);
    // break;
  }

  await cluster.idle();
  await cluster.close();
  console.log(JSON.stringify(stats, null, 2));
};
process();
export default process;
