export default function robots() {
  const baseUrl = "https://bokbuin.vercel.app"; // ✅ 여기만 바꿔줘!

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
