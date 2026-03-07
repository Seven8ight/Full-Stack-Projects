import type { IncomingMessage, ServerResponse } from "node:http";
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
import { verifyAccessToken, verifyRefreshToken } from "../../Utils/Jwt.js";

export const AuthController = (
  Database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean);

  const authRepo = new AuthRepo(Database),
    authService = new AuthService(authRepo);

  let unparsedRequestBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedRequestBody += data.toString();
  });

  request.on("end", async () => {
    try {
      const parsedRequestBody = JSON.parse(unparsedRequestBody);

      switch (pathNames[2]) {
        case "register":
          if (pathNames[3] == "legacy") {
            const registerUser = await authService.registerUser(
              parsedRequestBody,
              "legacy",
            );

            response.writeHead(201);
            response.end(JSON.stringify(registerUser));
          } else {
            if (pathNames[4] == "google") {
              if (pathNames[5] == "signup") {
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;

                response.writeHead(301, { location: authUrl });
                return response.end();
              } else if (pathNames[5] == "callback") {
                const googleCode = requestUrl.searchParams.get("code");

                const postData = new URLSearchParams({
                  code: googleCode!,
                  client_id: GOOGLE_CLIENT_ID!,
                  client_secret: GOOGLE_CLIENT_SECRET!,
                  redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI!,
                  grant_type: "authorization_code",
                }).toString();

                const googleTokenRequest = https.request(
                  "https://oauth2.googleapis.com/token",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                      "Content-Length": Buffer.byteLength(postData),
                    },
                  },
                  (tokenRes: IncomingMessage) => {
                    let body = "";

                    tokenRes.on("data", (d) => (body += d));
                    tokenRes.on("end", async () => {
                      const tokens = JSON.parse(body);

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
                          },
                          encryptedGoogleUser = await authService.registerUser(
                            googleUserPayload,
                            "oauth",
                            "google",
                          );

                        response.writeHead(302, {
                          location:
                            "http://localhost:3000/dashboard?oauth=google",
                          "set-cookie": `tokens=${JSON.stringify(encryptedGoogleUser)}; HttpOnly; SameSite=Lax; Path=/`,
                        });
                        response.end();
                      }
                    });
                  },
                );

                googleTokenRequest.write(postData);
                googleTokenRequest.end();
              }
            }
          }
          break;
        case "login":
          if (pathNames[3] == "legacy") {
            const logInUser = await authService.loginUser(
              parsedRequestBody,
              "legacy",
            );

            response.writeHead(201);
            response.end(JSON.stringify(logInUser));
          } else {
            if (pathNames[4] == "google") {
              if (pathNames[5] == "login") {
                response.writeHead(301, {
                  location: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`,
                });
                return response.end();
              } else if (pathNames[5] == "callback") {
                const googleCode = requestUrl.searchParams.get("code");

                const postData = new URLSearchParams({
                  code: googleCode!,
                  client_id: GOOGLE_CLIENT_ID!,
                  client_secret: GOOGLE_CLIENT_SECRET!,
                  redirect_uri: GOOGLE_LOGIN_REDIRECT_URI!,
                  grant_type: "authorization_code",
                }).toString();

                const googleTokenRequest = https.request(
                  "https://oauth2.googleapis.com/token",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                      "Content-Length": Buffer.byteLength(postData),
                    },
                  },
                  (tokenRes: IncomingMessage) => {
                    let body = "";

                    tokenRes.on("data", (d) => (body += d));
                    tokenRes.on("end", async () => {
                      const tokens = JSON.parse(body);

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
                          },
                          encryptedGoogleUser = await authService.loginUser(
                            googleUserPayload,
                            "oauth",
                          );

                        response.writeHead(302, {
                          location:
                            "http://localhost:3000/dashboard?oauth=google",
                          "set-cookie": `tokens=${JSON.stringify(encryptedGoogleUser)}; HttpOnly; SameSite=Lax; Path=/`,
                        });
                        response.end();
                      }
                    });
                  },
                );

                googleTokenRequest.write(postData);
                googleTokenRequest.end();
              }
            }
          }
          break;
        case "logout":
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          if (!type) {
            response.writeHead(404);
            response.end(JSON.stringify({ error: "Specify log out method" }));
            return;
          }

          const { authorization } = request.headers;

          if (!authorization) {
            response.writeHead(401);
            response.end(
              JSON.stringify({
                error: "User auth token not provided",
              }),
            );
            return;
          }

          const userVerifier = verifyAccessToken(authorization);

          if (type == "one")
            await authService.logOut(
              (userVerifier as any).user_id,
              parsedRequestBody.refreshToken,
            );
          else
            await authService.logOutAllDevices((userVerifier as any).user_id);

          response.writeHead(200);
          response.end(JSON.stringify("Successful log out"));
          break;
        case "refresh":
          const tokenVerifier = verifyRefreshToken(
            parsedRequestBody.refreshToken,
          );

          const refresh = await authService.refreshAuthToken(
            (tokenVerifier as any).user_id,
            parsedRequestBody.refreshToken,
          );

          response.writeHead(200);
          response.end(JSON.stringify(refresh));
          break;
        default:
          response.writeHead(404);
          response.end(
            JSON.stringify({
              error: "Unknown auth route",
            }),
          );
          break;
      }
    } catch (error) {
      response.writeHead(400);
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        }),
      );
    }
  });
};
