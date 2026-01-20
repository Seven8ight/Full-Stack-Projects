import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
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
    const { searchParams } = request.nextUrl,
      type = searchParams.get("type");

    if (type == "all") {
      const fetchAllTodosRequest = await fetch(
          "http://localhost:4000/api/todos/get?type=all",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
        fetchResponse = await fetchAllTodosRequest.json();

      if (!fetchAllTodosRequest.ok)
        return NextResponse.json(
          {
            error: fetchResponse.message,
          },
          {
            status: fetchAllTodosRequest.status,
          },
        );

      return NextResponse.json(fetchResponse, {
        status: fetchAllTodosRequest.status,
      });
    } else if (type == "specific") {
      const todoId = searchParams.get("todoid");

      if (!todoId)
        return NextResponse.json(
          {
            error: "Ensure to provide the todoid in the search params",
          },
          {
            status: 404,
          },
        );

      const fetchTodoRequest = await fetch(
          `http://localhost:4000/api/todos/get?type=one&todoid=${todoId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
        fetchResponse = await fetchTodoRequest.json();

      if (!fetchTodoRequest.ok)
        return NextResponse.json(
          {
            error: fetchResponse.message,
          },
          {
            status: fetchTodoRequest.status,
          },
        );

      return NextResponse.json(fetchResponse, {
        status: fetchTodoRequest.status,
      });
    } else {
      return NextResponse.json(
        {
          error: "Incorrect search param, not found",
        },
        {
          status: 404,
        },
      );
    }
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

export const POST = async (request: NextRequest) => {
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
    const todoBody = await request.json();

    const createTodoRequest: Response = await fetch(
        "http://localhost:4000/api/todo/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify(todoBody),
        },
      ),
      createTodoResponse = await createTodoRequest.json();

    if (!createTodoRequest.ok)
      return NextResponse.json(
        {
          error: createTodoResponse.error,
        },
        {
          status: createTodoRequest.status,
        },
      );

    return NextResponse.json(createTodoResponse, {
      status: createTodoRequest.status,
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
    const todoBody = await request.json();

    const updateTodoRequest: Response = await fetch(
        "http://localhost:4000/api/todo/edit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify(todoBody),
        },
      ),
      updateTodoResponse = await updateTodoRequest.json();

    if (!updateTodoRequest.ok)
      return NextResponse.json(
        {
          error: updateTodoResponse.error,
        },
        {
          status: updateTodoRequest.status,
        },
      );

    return NextResponse.json(updateTodoResponse, {
      status: updateTodoRequest.status,
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

export const DELETE = async (request: NextRequest) => {
  const token = request.headers.get("authorization");

  const requestUrl = new URL(
      request.url,
      `http://${request.headers.get("host")}`,
    ),
    searchParams = requestUrl.searchParams;

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
    const todoId = searchParams.get("todoid");

    const deleteTodoRequest: Response = await fetch(
        `http://localhost:4000/api/todo/delete?type=one&todoid=${todoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        },
      ),
      deleteTodoResponse = await deleteTodoRequest.json();

    if (!deleteTodoRequest.ok)
      return NextResponse.json(
        {
          error: deleteTodoResponse.error,
        },
        {
          status: deleteTodoRequest.status,
        },
      );

    return NextResponse.json(deleteTodoResponse, {
      status: deleteTodoRequest.status,
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
