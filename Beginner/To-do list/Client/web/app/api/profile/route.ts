import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const token = request.headers.get("authorization");

  if (!token)
    return NextResponse.json(
      {
        error: "Access Token should be provided",
      },
      {
        status: 400,
      },
    );

  try {
    const profileRetrieval: Response = await fetch(
        "http://localhost:4000/api/users/get",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.split(" ")[1]}`,
          },
        },
      ),
      profileRetrievalResponse = await profileRetrieval.json();

    if (!profileRetrieval.ok)
      return NextResponse.json(
        {
          error: profileRetrievalResponse.error,
        },
        {
          status: profileRetrieval.status,
        },
      );

    return NextResponse.json(profileRetrievalResponse, {
      status: 200,
    });
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

export const PATCH = async (request: NextRequest) => {
  const token = request.headers.get("authorization");

  if (!token) {
    return NextResponse.json(
      {
        error: "Authentication token required",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const requestBody = await request.json();

    const updateRequest = await fetch("http://localhost:4000/api/users/edit", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token.split(" ")[1]}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }),
      updateResponse = await updateRequest.json();

    if (!updateRequest.ok) {
      return NextResponse.json(
        {
          error: updateResponse.error,
        },
        {
          status: updateRequest.status,
        },
      );
    }

    return NextResponse.json(
      {
        message: "User updated",
      },
      {
        status: 200,
      },
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

export const DELETE = async (request: NextRequest) => {
  const token = request.headers.get("authorization");

  if (!token)
    return NextResponse.json(
      {
        error: "Authentication token required",
      },
      {
        status: 401,
      },
    );

  try {
    const deleteRequest: Response = await fetch(
        "http://localhost:4000/api/users/delete",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token.split(" ")[1]}`,
          },
        },
      ),
      deleteResponse = await deleteRequest.json();

    if (!deleteRequest.ok)
      return NextResponse.json(
        {
          error: deleteResponse.error,
        },
        {
          status: deleteRequest.status,
        },
      );

    return NextResponse.json(
      {
        message: deleteResponse.message,
      },
      {
        status: deleteRequest.status,
      },
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
