'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUserAccess } from '@/lib/useUserAccess';

export function PremiumGate({
  children,
  title = '프리미엄 분석',
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { loading, isLoggedIn, isSubscriber } = useUserAccess();

  if (loading) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        {title} 불러오는 중...
      </div>
    );
  }

  // 로그인 안함 → 로그인 유도
  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-base font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          이 내용은 구독 기능이며, 로그인 후 확인할 수 있어요.
        </p>
        <Button asChild>
          <Link href="/login">로그인하고 보기</Link>
        </Button>
      </div>
    );
  }

  // 로그인 했지만 구독 아님 → 구독 유도
  if (!isSubscriber) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-base font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          구독자 전용 분석입니다. 구독 후 이용할 수 있어요.
        </p>
        <Button asChild>
          <Link href="/subscribe">구독하러 가기</Link>
        </Button>
      </div>
    );
  }

  // 구독자 → 내용 표시
  return <>{children}</>;
}
