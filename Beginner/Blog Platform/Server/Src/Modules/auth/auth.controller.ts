import type { ClientRequest, IncomingMessage, ServerResponse } from "node:http";
import { AuthRepo } from "./auth.repository.js";
import { Database } from "../../Config/Database.js";
import { AuthService } from "./auth.service.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_LOGIN_REDIRECT_URI,
  GOOGLE_SIGNUP_REDIRECT_URI,
} from "../../Config/Env.js";
import type { loginUserDTO, registerUserDTO } from "./auth.types.js";
import https from "https";
import { verifyAccessToken, verifyRefreshToken } from "../../../Utils/Jwt.js";
import type { PublicUser } from "../users/user.types.js";

const fetchGoogleTokens = (code: string, redirectUri: string): Promise<any> => {
  const postData = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID!,
    client_secret: GOOGLE_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  }).toString();

  return new Promise((resolve, reject) => {
    const request: ClientRequest = https.request(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (response: IncomingMessage) => {
        let body = "";
        response.on("data", (d) => (body += d));
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error("Failed to parse Google response"));
          }
        });
      },
    );
    request.on("error", reject);
    request.write(postData);
    request.end();
  });
};

export const AuthController = (
  Database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean);

  const authRepo = new AuthRepo(Database),
    authService = new AuthService(authRepo);

  const sessionMetadata = {
    ip_address: request.socket.remoteAddress || "127.0.0.1",
    user_agent: request.headers["user-agent"] || "unknown",
  };

  let unparsedRequestBody: string = "";

  if (request.method != "POST" && pathNames[2] != "retrieve") {
    response.writeHead(405);
    response.end(JSON.stringify({ error: "Use POST instead" }));
    return;
  }

  request.on("data", (data: Buffer) => {
    unparsedRequestBody += data.toString();
  });

  request.on("end", async () => {
    try {
      const parsedRequestBody =
        unparsedRequestBody.trim().length > 0
          ? JSON.parse(unparsedRequestBody)
          : {};

      switch (pathNames[2]) {
        case "register":
          if (pathNames[3] === "legacy") {
            const newUserTokens = await authService.registerUser(
              { ...parsedRequestBody, ...sessionMetadata },
              "legacy",
            );
            response.writeHead(201, {
              // We send the tokens via cookie just like OAuth
              "set-cookie": `tokens=${JSON.stringify(newUserTokens)}; HttpOnly; SameSite=Lax; Path=/`,
              "Content-Type": "application/json",
            });

            // You can still return the user object (without tokens) if the UI needs it
            response.end(JSON.stringify({ message: "Signup successful" }));
          } else if (pathNames[3] === "oauth" && pathNames[4] === "google") {
            if (pathNames[5] === "signup") {
              const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
              response.writeHead(301, { location: authUrl });
              response.end();
            } else if (pathNames[5] === "callback") {
              const googleCode = requestUrl.searchParams.get("code");
              if (!googleCode) throw new Error("No code provided from Google");

              const tokens = await fetchGoogleTokens(
                googleCode,
                GOOGLE_SIGNUP_REDIRECT_URI!,
              );

              if (tokens.id_token) {
                const payload = JSON.parse(
                  Buffer.from(
                    tokens.id_token.split(".")[1],
                    "base64",
                  ).toString(),
                );
                const googleUserPayload: registerUserDTO = {
                  username: payload.name,
                  email: payload.email,
                  profile_image_url: payload.picture,
                  ...sessionMetadata,
                  refreshToken: "",
                  user_id: "",
                };

                const encryptedGoogleUser = await authService.registerUser(
                  googleUserPayload,
                  "oauth",
                  "google",
                );
                response.writeHead(302, {
                  location: "http://localhost:3000/dashboard?oauth=google",
                  "set-cookie": `tokens=${JSON.stringify(encryptedGoogleUser)}; HttpOnly; SameSite=Lax; Path=/`,
                });
                response.end();
              }
            }
          } else {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Invalid api route path",
              }),
            );
          }
          break;

        case "login":
          if (pathNames[3] === "legacy") {
            const logInUser = await authService.loginUser(
              { ...parsedRequestBody, ...sessionMetadata },
              "legacy",
            );
            response.writeHead(201, {
              // We send the tokens via cookie just like OAuth
              "set-cookie": `tokens=${JSON.stringify(logInUser)}; HttpOnly; SameSite=Lax; Path=/`,
              "Content-Type": "application/json",
            });

            // You can still return the user object (without tokens) if the UI needs it
            response.end(JSON.stringify({ message: "Login successful" }));
          } else if (pathNames[3] === "oauth" && pathNames[4] === "google") {
            if (pathNames[5] === "login") {
              response.writeHead(301, {
                location: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`,
              });
              response.end();
            } else if (pathNames[5] === "callback") {
              const googleCode = requestUrl.searchParams.get("code");
              if (!googleCode) throw new Error("No code provided from Google");

              const tokens = await fetchGoogleTokens(
                googleCode,
                GOOGLE_LOGIN_REDIRECT_URI!,
              );

              if (tokens.id_token) {
                const payload = JSON.parse(
                  Buffer.from(
                    tokens.id_token.split(".")[1],
                    "base64",
                  ).toString(),
                );

                const googleUserPayload: loginUserDTO = {
                  username: payload.name,
                  email: payload.email,
                  ...sessionMetadata,
                  refreshToken: "",
                  user_id: "",
                };

                const encryptedGoogleUser = await authService.loginUser(
                  googleUserPayload,
                  "oauth",
                );
                response.writeHead(302, {
                  location: "http://localhost:3000/dashboard?oauth=google",
                  "set-cookie": `tokens=${JSON.stringify(encryptedGoogleUser)}; HttpOnly; SameSite=Lax; Path=/`,
                });
                response.end();
              }
            }
          } else {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Invalid api route path",
              }),
            );
          }
          break;

        case "logout": {
          const type = requestUrl.searchParams.get("type");
          if (!type) {
            response.writeHead(404);
            return response.end(
              JSON.stringify({ error: "Specify log out method" }),
            );
          }

          const { authorization } = request.headers;
          if (!authorization) {
            response.writeHead(401);
            return response.end(
              JSON.stringify({ error: "User auth token not provided" }),
            );
          }

          const userVerifier = verifyAccessToken(authorization);

          if (type === "one") {
            await authService.logOut(
              (userVerifier as any).user_id,
              parsedRequestBody.refreshToken,
            );
          } else {
            await authService.logOutAllDevices((userVerifier as any).user_id);
          }

          response.writeHead(200);
          response.end(JSON.stringify("Successful log out"));
          break;
        }

        case "refresh": {
          const tokenVerifier = verifyRefreshToken(
            parsedRequestBody.refreshToken,
          );

          const refresh = await authService.refreshAuthToken(
            (tokenVerifier as any).id,
            parsedRequestBody.refreshToken,
          );
          response.writeHead(200, {
            "set-cookie": `accesstoken=${JSON.stringify(refresh.accessToken)}; HttpOnly; SameSite=Lax; Path=/`,
          });
          response.end();
          break;
        }

        case "retrieve":
          if (request.method != "GET") {
            response.writeHead(405);
            return response.end(
              JSON.stringify({
                error: "Invalid http method, try GET",
              }),
            );
          }
          const { authorization } = request.headers;
          if (!authorization) {
            response.writeHead(401);
            return response.end(
              JSON.stringify({
                error: "User unauthenticated, provide auth token",
              }),
            );
          }

          const userBody = verifyAccessToken(authorization);

          const userSessions = await authService.retrieveSessions(
            (userBody as any).id,
          );

          response.writeHead(200);
          response.end(JSON.stringify(userSessions));
          break;

        case "verify": {
          const { authorization } = request.headers;
          if (!authorization) {
            response.writeHead(401);
            response.end(
              JSON.stringify({
                error: "Authenticate yourself first",
              }),
            );
            return;
          }

          const userObject = verifyAccessToken(authorization),
            userId = (userObject as PublicUser).id;

          await authService.verifyUser(userId, true);

          response.writeHead(200);
          response.end(JSON.stringify({ message: "Verified" }));
        }

        default:
          response.writeHead(404);
          response.end(JSON.stringify({ error: "Unknown auth route" }));
          break;
      }
    } catch (error) {
      response.writeHead(400);
      response.end(JSON.stringify({ error: (error as Error).message }));
    }
  });
};
