import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    const postRequest: Response = await fetch(
        "http://localhost:4000/api/auth/register/legacy",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(body),
        },
      ),
      postResponse = await postRequest.json();

    if (!postRequest.ok) {
      const errorMessage = (postResponse.error as string).includes(
        'duplicate key value violates unique constraint "users_email_key"',
      )
        ? "Email already exists"
        : (postResponse.error as string).includes(
              'duplicate key value violates unique constraint "users_username_key"',
            )
          ? "Username already exists"
          : (postResponse.error as string);
      return NextResponse.json(
        {
          message: errorMessage || "Something went wrong",
          status: postRequest.status,
        },
        { status: postRequest.status },
      );
    }

    return NextResponse.json(postResponse, {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
        code: "AUTH_FAILED",
      },
      { status: 500 },
    );
  }
};
