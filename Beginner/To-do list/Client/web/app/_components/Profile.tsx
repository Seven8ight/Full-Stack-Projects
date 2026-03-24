"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export type Todo = {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  created_at: Date;
  status: "complete" | "incomplete" | "in progress";
};

const useProfile = () => {
  const [id, setId] = useState<string>(""),
    [username, setUsername] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [todos, setTodos] = useState<Todo[]>([]),
    [profileImage, setImage] = useState<string>("");

  const hasRefreshed = useRef(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const refreshUser = async () => {
      hasRefreshed.current = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return;

      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();

        const newToken =
          typeof refreshData.accessToken === "string"
            ? refreshData.accessToken
            : JSON.stringify(refreshData.accessToken);

        if (newToken.length > 8000) {
          toast.error("Authentication error - please log in again");
          localStorage.clear();
          return;
        }

        localStorage.setItem("accessToken", newToken);
        return newToken;
      }
    };

    const fetchProfile = async (token: string) => {
      const userFetchRequest = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userFetchRequest.status === 403 && !hasRefreshed.current) {
        const newToken = await refreshUser();
        if (newToken) return fetchProfile(newToken);
      }

      if (userFetchRequest.ok) {
        const profile = await userFetchRequest.json();
        setId(profile.id);
        setUsername(profile.username);
        setEmail(profile.email);
        setImage(profile.profileImage);
      }
    };

    const fetchTasks = async (token: string) => {
      const userTodosRequest = await fetch("/api/todos?type=all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userTodosRequest.status === 403 && !hasRefreshed.current) {
        const newToken = await refreshUser();
        if (newToken) return fetchTasks(newToken);
      }

      if (userTodosRequest.ok) {
        const userTodosResponse = await userTodosRequest.json();
        if (Array.isArray(userTodosResponse)) setTodos(userTodosResponse);
      } else {
        const errorResponse = await userTodosRequest.json();
        toast.error(
          `Error: ${userTodosRequest.status}, ${errorResponse.error}`,
        );
      }
    };

    (async () => {
      try {
        await fetchProfile(accessToken);
        await fetchTasks(accessToken);
      } catch (error) {
        toast.error(`${(error as Error).message}`);
      }
    })();
  }, []);

  return {
    id,
    username,
    email,
    profileImage,
    todos,
    setTodos,
    setUsername,
    setEmail,
  };
};

export default useProfile;
