export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado";
}
