import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const cookies = request.headers.get("cookie");

  const serverResponse = await fetch(
    "https://task-tracker-production-227e.up.railway.app/api/auth/me",
    {
      headers: {
        cookie: cookies || "",
      },
    },
  );

  const data = await serverResponse.json();

  return NextResponse.json(data);
};
