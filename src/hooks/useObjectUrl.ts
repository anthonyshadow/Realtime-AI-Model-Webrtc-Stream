import { useEffect, useState } from "react";

export function useObjectUrl(file: File | null) {
  const [objectUrl, setObjectUrl] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl({ file, url: nextUrl });

    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return objectUrl?.file === file ? objectUrl.url : null;
}
