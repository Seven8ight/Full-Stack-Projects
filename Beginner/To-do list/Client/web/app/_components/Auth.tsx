"use client";

import { useEffect, useState } from "react";

type tokens = {
  accessToken: string;
  refreshToken: string;
};

const useAuth = () => {
  const [data, setData] = useState<tokens>({
    accessToken: "",
    refreshToken: "",
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken"),
      refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken)
      setData({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
  }, []);

  return { ...data };
};

export default useAuth;
