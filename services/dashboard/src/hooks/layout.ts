export function useGenericLayout() {
  const element: HTMLElement | null = document.getElementById(
    "generic-layout-main-content",
  );

  function scrollToTop() {
    element?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return {
    scrollToTop,
  };
}
