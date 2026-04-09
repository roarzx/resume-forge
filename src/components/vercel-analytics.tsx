"use client";

import { useEffect } from "react";
import { inject } from "@vercel/analytics";

export default function VercelAnalytics() {
  useEffect(() => {
    inject();
  }, []);

  return null;
}
