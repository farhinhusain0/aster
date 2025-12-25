// src/hooks/useDocumentTitle.js
import { useEffect } from 'react';

function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]); // Rerun the effect only if the title changes
}

export default useDocumentTitle;