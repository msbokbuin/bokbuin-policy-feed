import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function sitemap() {
  const baseUrl = "https://bokbuin.vercel.app"; // ✅ 여기만 바꿔줘!

  const { supabase } = getSupabaseServer();

  // policy_items에서 최신 1000개만 sitemap에 넣기 (너무 많으면 느려짐)
  const { data: items, error } = await supabase
    .from("policy_items")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !items) {
    // 에러가 나도 sitemap 자체는 비어있게라도 반환 (검색엔진이 못 읽으면 안됨)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ];
  }

  // 홈도 포함
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...items.map((item) => ({
      url: `${baseUrl}/item/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
    })),
  ];

  return routes;
}
