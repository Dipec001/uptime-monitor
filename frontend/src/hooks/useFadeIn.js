import { useEffect, useState } from "react";

export default function useFadeIn() {
  const [fadeClass, setFadeClass] = useState("onboarding-enter");

  useEffect(() => {
    const t = setTimeout(() => {
      setFadeClass("onboarding-enter-active");
    }, 20);
    return () => clearTimeout(t);
  }, []);

  return fadeClass;
}
