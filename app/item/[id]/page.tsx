import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { PremiumGate } from "@/components/premium-gate";
import { ShareButton } from "@/components/share-button";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const revalidate = 60 * 60 * 2; // 2시간

const TYPE_COLORS: Record<string, string> = {
  입법예고: "bg-blue-100 text-blue-800",
  공포정책: "bg-green-100 text-green-800",
  "회의/논의": "bg-purple-100 text-purple-800",
  뉴스: "bg-orange-100 text-orange-800",
};

async function getItem(id: string) {
  const { supabase } = getSupabaseServer();

  const { data: item, error } = await supabase
    .from("policy_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) return null;
  return item;
}

export default async function ItemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

const item = await getItem(id);

if (!item) {
  notFound();
}
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": item.type === "뉴스" ? "NewsArticle" : "Article",
    headline: item.title,
    datePublished: String(item.date),
    dateModified: String(item.created_at ?? item.date),

    publisher: {
      "@type": "Organization",
      name: item.source ?? "프로젝트 복부인",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://bokbuin.vercel.app/item/${item.id}`,
    },
    url: `https://bokbuin.vercel.app/item/${item.id}`,
    description: item.summary ?? "",
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Button asChild variant="outline">
            <Link href="/">←</Link>
          </Button>

          <div className="text-sm text-muted-foreground">상세 보기</div>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Card>
          <CardHeader className="pb-3">
            {/* 버튼 영역 */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(item.source_url || item?.links?.[0]?.url) && (
                <a
                  href={item.source_url ?? item.links[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:opacity-80"
                >
                  원문 보기 ↗
                </a>
              )}

              {/* ✅ client component라서 그대로 둬도 됨 */}
              <ShareButton title={item.title ?? "정책 피드"} />
            </div>

            <div className="flex items-start justify-between gap-3 mb-2 mt-4">
              <Badge className={TYPE_COLORS[item.type] ?? ""}>{item.type}</Badge>
              <div className="text-sm text-muted-foreground">{item.date}</div>
            </div>

            <h1 className="text-2xl font-bold leading-tight">{item.title}</h1>

            <div className="text-sm text-muted-foreground mt-2">
              출처: {item.source}
            </div>
          </CardHeader>

          <CardContent>
            {item.summary && (
              <div className="mb-6">
                <div className="text-sm font-semibold mb-2">요약</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.summary}
                </p>
              </div>
            )}

            {Array.isArray(item.fullDescription) &&
              item.fullDescription.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-semibold mb-2">상세 내용</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    {item.fullDescription.map((line: string, idx: number) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* 관련 링크 */}
            {Array.isArray(item.links) && item.links.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold mb-2">관련 링크</div>

                <div className="space-y-2">
                  {item.links.map((l: any, idx: number) => (
                    <a
                      key={idx}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm underline underline-offset-4 hover:opacity-80"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 프리미엄 영역 */}
            <div className="mt-6">
              <PremiumGate title="영향 분석 / 대응 방안 / 향후 전망">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      📌 이해관계자 영향 분석
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      <li>매도인: (예시) 거래 타이밍/세금 부담 변화 가능</li>
                      <li>매수인: (예시) 대출/규제 변화로 접근성 영향</li>
                      <li>
                        임대인/임차인: (예시) 전월세 가격/계약 조건 변화
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🧭 대응 방안</h4>
                    <p className="text-sm text-muted-foreground">
                      (예시) 계약 전 확인 체크리스트, 유예기간 활용, 리스크 분산
                      전략 등
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🔮 향후 예상</h4>
                    <p className="text-sm text-muted-foreground">
                      (예시) 단기/중기 시장 반응 시나리오와 예상 변동 포인트
                    </p>
                  </div>
                </div>
              </PremiumGate>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
