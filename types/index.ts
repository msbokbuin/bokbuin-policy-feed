export type PolicyType = '입법예고' | '공포정책' | '회의/논의' | '뉴스';

export interface PolicyItem {
  id: string;
  type: PolicyType;
  title: string;
  date: string;
  source: string;
  summary: string;
  fullDescription: string[];
  links: {
    label: string;
    url: string;
  }[];
}
