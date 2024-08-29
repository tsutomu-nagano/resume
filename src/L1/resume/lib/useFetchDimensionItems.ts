import { useState, useEffect } from "react";
import { fetchDimensionItems } from "./apolloClient"

export const useFetchDimensionItems = (name: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await fetchDimensionItems(name);
      setData(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, fetch, loading, error };
};
