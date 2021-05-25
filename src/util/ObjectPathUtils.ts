export function toDotPath(slashPath: string): string {
  return slashPath.replace(/^\//, '').replaceAll(/(?!^)\//g, '.')
}
