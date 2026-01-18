"use client";

import { useEffect, useState, useRef } from "react";

const useProfile = () => {
  const [id, setId] = useState<string>(""),
    [username, setUsername] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [profileImage, setImage] = useState<string>("");

  const hasRefreshed = useRef(false); // 🔒 guard

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        const profile = await res.json();

        setId(profile.id);
        setUsername(profile.username);
        setEmail(profile.email);
        setImage(profile.profileImage);
        return;
      }

      // 🔥 Access token expired
      if (res.status === 403 && !hasRefreshed.current) {
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

        await fetchProfile();
      }
    };

    fetchProfile().catch(console.error);
  }, []);

  return { id, username, email, profileImage };
};

export default useProfile;
