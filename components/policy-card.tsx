'use client';

import Link from "next/link";
import { PolicyItem } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PolicyCardProps {
  item: PolicyItem;
}

const TYPE_COLORS = {
  '입법예고': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  '공포정책': 'bg-green-100 text-green-800 hover:bg-green-200',
  '회의/논의': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  '뉴스': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
};

export function PolicyCard({ item }: PolicyCardProps) {
  return (
    <Link href={`/item/${item.id}`} className="block">
      <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge className={TYPE_COLORS[item.type]}>
              {item.type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {item.date}
            </span>
          </div>

          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
            {item.title}
          </h3>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.summary}
          </p>
          <p className="text-xs text-muted-foreground">
            출처: {item.source}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
