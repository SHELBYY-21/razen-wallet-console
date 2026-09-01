export function authorize(header: string | null): boolean {
  const expected = process.env.RAZEN_MCP_TOKEN?.trim();
  if (!expected) return true;
  if (!header) return false;
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim();
  return token === expected;
}
