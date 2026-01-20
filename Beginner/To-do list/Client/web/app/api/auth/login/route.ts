import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const requestBody: any = await request.json();

    if (!requestBody)
      return NextResponse.json(
        {
          error: "Request body invalid",
        },
        {
          status: 404,
        },
      );

    const loginRequest: Response = await fetch(
        "http://localhost:4000/api/auth/login/legacy",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      ),
      loginResponse = await loginRequest.json();

    if (!loginRequest.ok)
      return NextResponse.json({
        error: `${loginResponse.error}`,
      });

    return NextResponse.json(loginResponse, {
      status: loginRequest.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `${(error as Error).message}`,
      },
      { status: 400 },
    );
  }
};
