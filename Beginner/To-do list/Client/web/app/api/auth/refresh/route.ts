import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const requestBody = await request.json(),
    refreshToken = requestBody.refreshToken;

  if (!refreshToken)
    return NextResponse.json(
      {
        error: "Refresh token must be provided",
      },
      {
        status: 404,
      },
    );

  try {
    const refreshTokenRequest: Response = await fetch(
        "http://localhost:4000/api/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: refreshToken,
          }),
        },
      ),
      refreshTokenResponse: any = await refreshTokenRequest.json();

    if (!refreshTokenRequest.ok) {
      return NextResponse.json(
        {
          error: refreshTokenResponse.error,
        },
        {
          status: refreshTokenRequest.status,
        },
      );
    }

    return NextResponse.json(refreshTokenResponse, {
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 400,
      },
    );
  }
};
