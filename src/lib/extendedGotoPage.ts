const delay = (t, v) => {
  return new Promise((resolve) => {
    setTimeout(resolve.bind(null, v), t);
  });
};
const extendedGotoPage = async ({ page, url }) => {
  try {
    await Promise.race([
      page.goto(url, { waitUntil: "networkidle2" }),
      delay(25000, () => {
        console.log("skiped because enoght time have passed");
      }),
    ]);
  } catch (e) {
    console.log("Error 4 Going to extended page =>", e.message);
  }
};

export default extendedGotoPage;
