import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { visitedPaths } from "@/hooks/useInView";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Track the path we're currently on so we can mark it "visited" the moment
  // we navigate away from it — NOT on mount, which races with async content
  // (rows that mount after data loads would otherwise skip their animation).
  const currentPath = useRef(router.pathname);
  currentPath.current = router.pathname;

  useEffect(() => {
    const markVisited = () => {
      // routeChangeStart fires before the route changes, so currentPath is
      // still the page we're leaving — the one whose entrance is now "done".
      visitedPaths.add(currentPath.current);
    };
    router.events.on("routeChangeStart", markVisited);
    return () => router.events.off("routeChangeStart", markVisited);
  }, [router.events]);

  return <Component {...pageProps} />;
}
