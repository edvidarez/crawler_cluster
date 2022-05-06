import AWS from "aws-sdk";
AWS.config.update({ region: "us-east-1" });

import path from "path";
import fs from "fs";

const getFileKey = (url: string) => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}_${today.getMonth()}_${
    today.getDay() + 1
  } ${today.getHours()}:${today.getMinutes()}`;
  const hostname = new URL(url).hostname;
  const hostKey = `${hostname}_${dateStr}.png`;
  return hostKey;
};

const savePage = async ({ page, dirr, name }) => {
  const html = await page.content();

  if (!fs.existsSync(path.join(...dirr)))
    fs.mkdirSync(path.join(...dirr), { recursive: true });
  fs.writeFileSync(path.join(...dirr, `${name}.html`), html);
  const base64 = await page.screenshot({
    path: path.join(...dirr, `${name}.png`),
    fullPage: true,
  });

  const hostKey = getFileKey(page.url());
  console.log("hostKey", hostKey);
  try {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: "screenshots-adn",
      Key: hostKey,
      Body: base64 || "",
    };
    const s3 = new AWS.S3();
    await s3.upload(params).promise();
    console.log("file_uploaded");
  } catch (err) {
    console.log("error uploading to s3", err.message);
  }
};

export default savePage;
