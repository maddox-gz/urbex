import { useState, useEffect } from "react";
import { useAuth } from "./auth/useAuth";

export default function useUser() {
  const { auth, isReady } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isReady) {
        return;
      }

      if (!auth) {
        setData(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const userData = await response.json();
          setData(userData.user);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [auth, isReady]);

  const refetch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const userData = await response.json();
        setData(userData.user);
      }
    } catch (err) {
      console.error("Error refetching user:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
