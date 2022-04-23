import {RequestOptions, RequestResponse, request} from "@miqro/request";

import {existsSync, unlinkSync} from "fs";
import {createServer, RequestListener} from "http";

export async function TestHelper(app: {
  listener: RequestListener;
} | RequestListener, options: RequestOptions, cb?: (response: RequestResponse) => void): Promise<RequestResponse> {
  const unixSocket = `/tmp/socket.test.helper`;
  if (existsSync(unixSocket)) {
    unlinkSync(unixSocket);
  }
  const server = createServer(typeof app === "function" ? app : app.listener);
  return new Promise<RequestResponse>((resolve, reject) => {
    server.listen(unixSocket, () => {
      request({
        disableThrow: true,
        ...options,
        socketPath: unixSocket
      }).then((response: any) => {
        server.close(() => {
          if (existsSync(unixSocket)) {
            unlinkSync(unixSocket);
          }
          if (cb) {
            try {
              cb(response);
            } catch (ee) {
              reject(ee);
            }
          }
          resolve(response);
        });
      }).catch((e: any) => {
        server.close(() => {
          if (existsSync(unixSocket)) {
            unlinkSync(unixSocket);
          }
          if (cb) {
            try {
              cb(e as any);
            } catch (ee) {
              reject(ee);
            }
            resolve(undefined as any);
          } else {
            reject(e);
          }
        });
      });
    });
  });
}
