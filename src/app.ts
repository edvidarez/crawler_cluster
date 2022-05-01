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
    const html = await crawl(req.body);
    res.json({ html });
  });
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log("server started on port 3000");
  });
};
start();
