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

  const hasRefreshed = useRef(false); // 🔒 guard

  // useEffect(() => {
  //   const getAuthenticatedData = async () => {
  //     let token = localStorage.getItem("accessToken");

  //     const authenticatedFetch = async (
  //       url: string,
  //       options: RequestInit = {},
  //     ) => {
  //       let res = await fetch(url, {
  //         ...options,
  //         headers: { ...options.headers, Authorization: `Bearer ${token}` },
  //       });

  //       // If expired, try to refresh ONCE
  //       if (res.status === 403 && !hasRefreshed.current) {
  //         hasRefreshed.current = true;
  //         const refreshToken = localStorage.getItem("refreshToken");

  //         const refreshRes = await fetch("/api/auth/refresh", {
  //           method: "POST",
  //           body: JSON.stringify({ refreshToken }),
  //           headers: { "Content-Type": "application/json" },
  //         });

  //         if (refreshRes.ok) {
  //           const data = await refreshRes.json();
  //           localStorage.setItem("accessToken", data.accessToken);
  //           token = data.accessToken; // Update local variable for the retry!

  //           // Retry the original request with the NEW token
  //           res = await fetch(url, {
  //             ...options,
  //             headers: { ...options.headers, Authorization: `Bearer ${token}` },
  //           });
  //         }
  //       }
  //       return res;
  //     };

  //     try {
  //       const profileRes = await authenticatedFetch("/api/profile");
  //       if (profileRes.ok) {
  //         const profile = await profileRes.json();
  //         setId(profile.id);
  //         // ... set other states
  //       }

  //       const tasksRes = await authenticatedFetch("/api/todos?type=all");
  //       if (tasksRes.ok) {
  //         const tasks = await tasksRes.json();
  //         setTodos(tasks);
  //       }
  //     } catch (err) {
  //       console.error("Fetch failed", err);
  //     }
  //   };

  //   getAuthenticatedData();
  // }, []);

  // useEffect(() => {
  //   const accessToken = localStorage.getItem("accessToken");
  //   if (!accessToken) return;

  //   const refreshUser = async () => {
  //       hasRefreshed.current = true;

  //       const refreshToken = localStorage.getItem("refreshToken");
  //       if (!refreshToken) return;

  //       const refreshRes = await fetch("/api/auth/refresh", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ refreshToken }),
  //       });

  //       if (!refreshRes.ok) return;

  //       const refreshData = await refreshRes.json();

  //       localStorage.setItem("accessToken", refreshData.accessToken);
  //     },
  //     fetchProfile = async () => {
  //       const userFetchRequest = await fetch("/api/profile", {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       });

  //       // 🔥 Access token expired
  //       if (userFetchRequest.status === 403 && !hasRefreshed.current) {
  //         await refreshUser();
  //         await fetchProfile();
  //       }
  //       const userTodosRequest = await fetch("/api/todos?type=all", {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       });

  //       if (userFetchRequest.ok) {
  //         const profile = await userFetchRequest.json();

  //         setId(profile.id);
  //         setUsername(profile.username);
  //         setEmail(profile.email);
  //         setImage(profile.profileImage);
  //         return;
  //       }
  //       if (userTodosRequest.ok) {
  //         const userTodos = await userTodosRequest.json();

  //         setTodos(userTodos);
  //       }
  //     },
  //     fetchTasks = async () => {
  //       const userTodosRequest = await fetch("/api/todos?type=all", {
  //         method: "GET",
  //         headers: {
  //           Authorization: accessToken,
  //         },
  //       });

  //       if (userTodosRequest.status === 403 && !hasRefreshed.current) {
  //         await refreshUser();
  //         await fetchTasks();
  //       }

  //       const userTodosResponse = await userTodosRequest.json();
  //       console.log(userTodosResponse);
  //       if (!userTodosRequest.ok) {
  //         toast.error(
  //           `Error: ${userTodosRequest.status}, ${userTodosResponse.error}`,
  //         );
  //         return;
  //       }

  //       if (Array.isArray(userTodosResponse)) setTodos(userTodosResponse);
  //     };

  //   (async () => {
  //     try {
  //       await fetchProfile();
  //       await fetchTasks();
  //     } catch (error) {
  //       toast.error(`${(error as Error).message}`);
  //       return;
  //     }
  //   })();
  // }, []);

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

        // 🔍 Validate token is a string
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
          Authorization: `Bearer ${token}`, // ✅ Fixed: Added "Bearer "
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
  return { id, username, email, profileImage, todos };
};

export default useProfile;
