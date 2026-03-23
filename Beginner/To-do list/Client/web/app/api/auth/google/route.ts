import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (_: NextRequest) => {
  const requestCookies = await cookies(),
    oauthToken = requestCookies.get("tokens");

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
