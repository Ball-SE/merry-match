import { useState, useEffect } from "react";
import FullScreenLoader from "@/components/loader/FullScreenLoader";

export default function TestLoaderPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // loader 3 วินาที
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <FullScreenLoader show={loading} />
      {!loading && (
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-3xl font-bold">Content Loaded!</h1>
        </div>
      )}
    </>
  );
}
