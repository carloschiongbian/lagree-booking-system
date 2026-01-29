type JwtPayload = {
  sub?: string;
};

export function parseUserId(authHeader: string): string | null {
  if (!authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "").trim();

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as JwtPayload;

    return payload.sub ?? null;
  } catch {
    return null;
  }
}
