import Script from "next/script";

export const Analytics = () =>
  process.env.VERCEL_ENV === "production" && (
    <Script
      async
      defer
      src={process.env.UMAMI_SCRIPT_URL}
      data-website-id={process.env.UMAMI_WEBSITE_ID}
    />
  );
