"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export type Todo = {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  createdDate: Date;
  status: "complete" | "incomplete" | "in progress";
};

const useProfile = () => {
  const [id, setId] = useState<string>(""),
    [username, setUsername] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [todos, setTodos] = useState<Todo[]>([]),
    [profileImage, setImage] = useState<string>("");

  const hasRefreshed = useRef(false); // 🔒 guard

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const refreshUser = async () => {
        hasRefreshed.current = true;

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return;

        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) return;

        const refreshData = await refreshRes.json();

        localStorage.setItem("accessToken", refreshData.accessToken);
      },
      fetchProfile = async () => {
        const userFetchRequest = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // 🔥 Access token expired
        if (userFetchRequest.status === 403 && !hasRefreshed.current) {
          await refreshUser();
          await fetchProfile();
        }
        const userTodosRequest = await fetch("/api/todos/get?type=all", {
          method: "GET",
          headers: {
            Authorization: accessToken,
          },
        });

        if (userFetchRequest.ok) {
          const profile = await userFetchRequest.json();

          setId(profile.id);
          setUsername(profile.username);
          setEmail(profile.email);
          setImage(profile.profileImage);
          return;
        }
        if (userTodosRequest.ok) {
          const userTodos = await userTodosRequest.json();

          setTodos(userTodos);
        }
      },
      fetchTasks = async () => {
        const userTodosRequest = await fetch("/api/todos?type=all", {
          method: "GET",
          headers: {
            Authorization: accessToken,
          },
        });

        if (userTodosRequest.status === 403 && !hasRefreshed.current) {
          await refreshUser();
          await fetchTasks();
        }

        const userTodosResponse = await userTodosRequest.json();
        console.log(userTodosResponse);
        if (!userTodosRequest.ok) {
          toast.error(
            `Error: ${userTodosRequest.status}, ${userTodosResponse.error}`,
          );
          return;
        }

        if (Array.isArray(userTodosResponse)) setTodos(userTodosResponse);
      };

    (async () => {
      try {
        await fetchProfile();
        await fetchTasks();
      } catch (error) {
        toast.error(`${(error as Error).message}`);
        return;
      }
    })();
  }, []);

  return { id, username, email, profileImage, todos };
};

export default useProfile;
