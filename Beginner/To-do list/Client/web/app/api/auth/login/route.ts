import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const profileRetrieval: Response = await fetch(
      "http://localhost:4000/api/users/get",
    );
  } catch (error) {
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
