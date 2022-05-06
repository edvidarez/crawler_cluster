import "dotenv/config";
import express from "express";
import { crawl } from "./crawler";
import { scrape } from "./scrape";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ ok: true });
});

app.post("/crawl", async (req, res) => {
  console.log(req.body);
  const links = await crawl(req.body);
  res.send(links);
});
app.post("/scrape", async (req, res) => {
  const response = await scrape(req.body);
  res.setHeader("Content-Type", "text/html");
  res.send(response);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("server started on port", port);
});
