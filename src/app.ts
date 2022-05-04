import express from "express";
import { crawl, addToQueue } from "./crawler";

const start = () => {
  const app = express();

  // body parser post rest
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/", (req, res) => {
    res.json({ ok: true });
  });
  app.post("/", async (req, res) => {
    console.log(req.body);
    addToQueue(req.body);
    res.json({ message: `url ${req.body.url} added to the queue` });
  });
  app.post("/crawl", async (req, res) => {
    console.log(req.body);
    const response = await crawl(req.body);
    res.setHeader("Content-Type", "text/html");
    res.send(response);
  });
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log("server started on port", port);
  });
};
start();
