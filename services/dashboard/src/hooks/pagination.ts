import { useSearchParams } from "react-router-dom";

export function usePaginationNavigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  function setPage(page: number) {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  }

  return {
    page,
    setPage,
  };
}
