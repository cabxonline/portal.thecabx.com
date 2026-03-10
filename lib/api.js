export async function api(endpoint, options = {}) {

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    }
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "API Error")
  }

  return data
}