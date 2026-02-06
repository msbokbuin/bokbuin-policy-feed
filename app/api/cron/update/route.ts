import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { XMLParser } from "fast-xml-parser";

// 2시간마다(선택) — API 자체는 크론이 호출하므로 없어도 됨
// export const revalidate = 60 * 60 * 2;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET!;

// ✅ 서버 전용 admin client
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

type IncomingItem = {
  type: "뉴스" | "회의/논의" | "입법예고" | "공포정책";
  title: string;
  date: string; // YYYY-MM-DD
  source: string;
  summary?: string;
  source_url?: string;
  links?: { label: string; url: string }[];
  full_description?: string[];
  canonical_url?: string;
};

function toDateOnly(input: string) {
  // RSS pubDate는 다양한 형식일 수 있어서, 최대한 안전하게 Date로 변환
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function sha(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/** ✅ RSS(XML) 읽어서 items 배열로 반환 */
async function fetchRss(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "bokbuin/1.0" } });
  if (!res.ok) throw new Error(`RSS fetch failed: ${url} (${res.status})`);
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const json = parser.parse(xml);
  const raw = json?.rss?.channel?.item ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr;
}

/** ✅ 2) 국토교통부 보도/자료: korea.kr 부처 RSS */
async function fetchMolitFromKoreaRss(): Promise<IncomingItem[]> {
  const items = await fetchRss("https://www.korea.kr/rss/dept_molit.xml");

  return items
    .map((it: any) => {
      const title = (it.title ?? "").trim();
      const link = (it.link ?? "").trim();
      const date = toDateOnly(it.pubDate ?? it["dc:date"] ?? "");
      if (!title || !link || !date) return null;

      return {
        type: "뉴스",
        title,
        date,
        source: "국토교통부(정책브리핑)",
        summary: (it.description ?? "").replace(/<[^>]+>/g, "").trim(),
        source_url: link,
        canonical_url: link,
        links: [{ label: "정책브리핑 원문", url: link }],
      } satisfies IncomingItem;
    })
    .filter(Boolean) as IncomingItem[];
}

/** ✅ 3) 정부포털(정책브리핑) 보도자료 전체 RSS → 부동산 키워드만 필터 */
async function fetchPressReleaseFromKoreaRss(): Promise<IncomingItem[]> {
  const items = await fetchRss("https://www.korea.kr/rss/pressrelease.xml");

  const KEYWORDS = [
    "부동산",
    "주택",
    "아파트",
    "전세",
    "월세",
    "임대",
    "임대차",
    "분양",
    "재개발",
    "재건축",
    "청약",
    "토지",
    "공시가격",
    "대출",
    "DSR",
    "LTV",
  ];

  return items
    .map((it: any) => {
      const title = (it.title ?? "").trim();
      const link = (it.link ?? "").trim();
      const date = toDateOnly(it.pubDate ?? it["dc:date"] ?? "");
      if (!title || !link || !date) return null;

      const text = `${title} ${(it.description ?? "")}`.replace(/<[^>]+>/g, "");
      const hit = KEYWORDS.some((k) => text.includes(k));
      if (!hit) return null;

      return {
        type: "뉴스",
        title,
        date,
        source: "정책브리핑(보도자료)",
        summary: text.trim().slice(0, 400),
        source_url: link,
        canonical_url: link,
        links: [{ label: "정책브리핑 원문", url: link }],
      } satisfies IncomingItem;
    })
    .filter(Boolean) as IncomingItem[];
}

/** ✅ 1) 입법예고: 법제처 목록 페이지(HTML)에서 제목/링크/날짜 뽑기 (간단 스크랩) */
async function fetchLegislationNotices(): Promise<IncomingItem[]> {
  const url = "https://www.moleg.go.kr/lawinfo/makingList.mo?mid=a10104010000";
  const res = await fetch(url, { headers: { "User-Agent": "bokbuin/1.0" } });
  if (!res.ok) throw new Error(`moleg list fetch failed (${res.status})`);
  const html = await res.text();

  // 아주 단순한 방식: 링크/날짜 패턴을 최대한 안전하게 잡아서 뽑기
  // ⚠️ 사이트 HTML이 바뀌면 수정 필요(그때 스샷 보내주면 바로 고쳐줄게)
  const results: IncomingItem[] = [];

  // makingView.mo 링크를 찾아서 뽑기
  const linkRegex = /href="([^"]*makingView\.mo[^"]*)".*?>([^<]+)<\/a>/g;
  const dateRegex = /(\d{4}-\d{2}-\d{2})/g;

  // 1) 링크 + 제목 모으기
  const foundLinks: { title: string; link: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1];
    const title = m[2].trim();
    if (!title) continue;

    const abs = href.startsWith("http")
      ? href
      : `https://www.moleg.go.kr${href.startsWith("/") ? "" : "/"}${href}`;

    // 중복 링크 제거
    if (!foundLinks.some((x) => x.link === abs)) {
      foundLinks.push({ title, link: abs });
    }
    if (foundLinks.length >= 30) break; // 첫 페이지에서 30개만
  }

  // 2) 날짜(예고일자)가 HTML에 여러 개라서 “순서대로” 대응시키는 간단 방식
  const dates = Array.from(html.matchAll(dateRegex)).map((x) => x[1]);

  for (let i = 0; i < foundLinks.length; i++) {
    const { title, link } = foundLinks[i];
    const date = dates[i] ?? null; // 완벽 매칭은 아니지만 초보용 1차 구현
    if (!date) continue;

    // 부동산 관련 키워드만(원하면 나중에 “국토부 소관” 필터도 추가 가능)
    const KEYWORDS = ["부동산", "주택", "토지", "임대차", "전세", "월세", "분양", "재개발", "재건축", "청약"];
    const hit = KEYWORDS.some((k) => title.includes(k));
    if (!hit) continue;

    results.push({
      type: "입법예고",
      title,
      date,
      source: "법제처",
      summary: "",
      source_url: link,
      canonical_url: link,
      links: [{ label: "법제처 원문", url: link }],
    });
  }

  return results;
}

/** ✅ 뉴스만 1년 지난 데이터 정리 */
async function cleanupOldNews() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const yyyy = oneYearAgo.getFullYear();
  const mm = String(oneYearAgo.getMonth() + 1).padStart(2, "0");
  const dd = String(oneYearAgo.getDate()).padStart(2, "0");
  const cutoff = `${yyyy}-${mm}-${dd}`;

  await supabaseAdmin
    .from("policy_items")
    .delete()
    .eq("type", "뉴스")
    .lt("date", cutoff);
}

export async function GET(req: Request) {
  // 0) 시크릿 체크
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // 1) 수집
  const batches = await Promise.allSettled([
    fetchLegislationNotices(),
    fetchMolitFromKoreaRss(),
    fetchPressReleaseFromKoreaRss(),
  ]);

  const collected: IncomingItem[] = [];
  for (const r of batches) {
    if (r.status === "fulfilled") collected.push(...r.value);
  }

  // 2) DB 저장(중복은 canonical_url/content_hash로 방지)
  let inserted = 0;
  let skipped = 0;

  for (const it of collected) {
    const canonicalUrl = it.canonical_url ?? it.source_url ?? null;
    const contentHash = sha(`${it.type}|${it.source}|${it.date}|${it.title}|${canonicalUrl ?? ""}`);

    const payload: any = {
      type: it.type,
      title: it.title,
      date: it.date,
      source: it.source,
      summary: it.summary ?? "",
      links: it.links ?? [],
      full_description: it.full_description ?? [],
      source_url: it.source_url ?? null,
      canonical_url: canonicalUrl,
      content_hash: contentHash,
    };

    // upsert: 중복이면 update/skip 가능
    const { error } = await supabaseAdmin
      .from("policy_items")
      .upsert(payload, { onConflict: "content_hash" });

    if (error) {
      // unique 충돌이면 skip으로 처리
      skipped++;
    } else {
      inserted++;
    }
  }

  // 3) 뉴스 1년 정리
  await cleanupOldNews();

  return NextResponse.json({
    ok: true,
    found: collected.length,
    inserted,
    skipped,
    cleaned: true,
  });
}
