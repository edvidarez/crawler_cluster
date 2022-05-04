import path from "path";
import fs from "fs";
const scrape = async ({ page, data: { url } }) => {
  console.log("going to url", url, " ");
  const { hostname, pathname } = new URL(url);
  console.log("pathname", pathname);
  await page.goto(url, { waitUntil: "networkidle2" });
  const html = await page.content();
  // write html to the same directory
  if (!fs.existsSync(path.join("sites", hostname, pathname)))
    fs.mkdirSync(path.join("sites", hostname, pathname), { recursive: true });
  fs.writeFileSync(path.join("sites", hostname, pathname, "page.html"), html);
};

export default scrape;
