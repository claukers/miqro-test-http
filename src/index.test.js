const {fake, requireMock} = require("@miqro/test");
const {strictEqual} = require("assert");

describe("TestHelper unit tests", () => {
  it("happy path", async () => {
    const badArgs = {
      bad: "bad bad"
    };
    const badListener = "some bad value2";
    const fakeResponse = "some bad response";
    const fakeListen = fake((unixSocket, cb) => {
      strictEqual(unixSocket, `/tmp/socket.test.helper`);
      strictEqual(fakeClose.callCount, 0);
      cb();
    });
    const fakeClose = fake((cb) => {
      strictEqual(fakeListen.callCount, 1);
      cb();
    });
    const fakeServer = {
      listen: fakeListen,
      close: fakeClose
    }
    const {TestHelper} = requireMock("../dist/index.js", {
      ["@miqro/request"]: {
        request: async (args) => {
          strictEqual(fakeListen.callCount, 1);
          strictEqual(fakeClose.callCount, 0);
          strictEqual(args.bad, badArgs.bad);
          strictEqual(args.disableThrow, true);
          strictEqual(args.socketPath, `/tmp/socket.test.helper`);
          return fakeResponse;
        }
      },
      http: {
        createServer: (args) => {
          strictEqual(fakeListen.callCount, 0);
          strictEqual(fakeClose.callCount, 0);
          strictEqual(args, badListener);
          return fakeServer;
        }
      }
    });
    const response = await TestHelper({
      listener: badListener
    }, badArgs);
    strictEqual(response, fakeResponse);
    strictEqual(fakeListen.callCount, 1);
    strictEqual(fakeClose.callCount, 1);
  });
});

