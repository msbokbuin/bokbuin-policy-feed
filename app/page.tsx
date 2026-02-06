'use client';

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PolicyType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PolicyCard } from "@/components/policy-card";
import { EmptyState } from "@/components/empty-state";

const TABS: PolicyType[] = ["뉴스", "회의/논의", "입법예고", "공포정책"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<PolicyType>("뉴스");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("policy_items")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;
        setItems(data ?? []);
      } catch (err) {
        console.error("Supabase fetch failed:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  // 현재 탭 데이터만 미리 계산 (반복 filter 제거)
  const filteredData = useMemo(
    () => items.filter((item) => item.type === activeTab),
    [items, activeTab]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">정책 피드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            최신 정책 동향을 한눈에 확인하세요
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PolicyType)}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-sm">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {loading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  불러오는 중...
                </div>
              ) : tab === activeTab ? (
                filteredData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.map((item) => (
                      <PolicyCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message={`${tab} 항목이 없습니다.`} />
                )
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 프로젝트 복부인. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
