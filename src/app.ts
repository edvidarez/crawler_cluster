import express from "express";
import crawl from "./crawler";

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
    crawl(req.body);
    res.json({ message: `url ${req.body.url} added to the queue` });
  });
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log("server started on port", port);
  });
};
start();
