import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  console.log("Called");
  const requestCookies = await cookies(),
    oauthToken = requestCookies.get("tokens");

  console.log(typeof oauthToken?.value);
  console.log(oauthToken?.value);
  if (!oauthToken)
    return NextResponse.json(
      {
        error: "Tokens not found",
      },
      {
        status: 404,
      },
    );
  const tokens = JSON.parse(oauthToken.value);

  return NextResponse.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
};
