const BASE_URL = import.meta.env.VITE_API_URL || "/bfhl";

export const postBFHL = async (payload) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
};

export const getBFHL = async () => {
  const res = await fetch(BASE_URL);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
};
