export function getAnchorFromEvent(event: Event): HTMLAnchorElement | null {
  const target = event.target as HTMLElement;
  return target.closest("a");
}
