const {strictEqual} = require("assert");
const {TestHelper} = require("../dist");

describe("TestHelper func tests", () => {
  it("empty test", async () => {
    console.log(process.pid);
    const response = await TestHelper((req, res) => {
      try {
        console.dir(req.url);
        strictEqual(req.url, "/hello");
        strictEqual(req.method, "POST");
        res.statusCode = 200;
        res.end(String("world!"));
      } catch (e) {
        console.error(e);
      }
    }, {
      url: "/hello",
      method: "post"
    });
    strictEqual(response.data, "world!");
  });
});
