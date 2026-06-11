export function shouldUseDevStore(error: unknown): boolean {
  const message = String(error ?? "");
  return (
    message.includes("DATABASE_URL") ||
    message.includes("PrismaClientInitializationError") ||
    message.includes("Can't reach database server")
  );
}
