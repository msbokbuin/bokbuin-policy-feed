# 정책 피드 (Policy Feed)

Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui로 구축된 정책 정보 피드 애플리케이션입니다.

## 🚀 기능

- **탭 기반 필터링**: 입법예고, 공포정책, 회의/논의, 뉴스 4가지 카테고리
- **반응형 디자인**: 모바일(1열), 태블릿(2열), 데스크탑(3열) 그리드
- **상세 페이지**: 각 정책의 상세 정보 및 관련 링크 제공
- **현대적인 UI**: shadcn/ui 컴포넌트 활용

## 📋 프로젝트 구조

```
policy-feed/
├── app/
│   ├── item/[id]/
│   │   └── page.tsx          # 상세 페이지
│   ├── globals.css            # 글로벌 스타일
│   ├── layout.tsx             # 루트 레이아웃
│   └── page.tsx               # 메인 피드 페이지
├── components/
│   ├── ui/                    # shadcn/ui 컴포넌트
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── tabs.tsx
│   ├── empty-state.tsx        # 빈 상태 컴포넌트
│   ├── loading-skeleton.tsx   # 로딩 스켈레톤
│   └── policy-card.tsx        # 정책 카드 컴포넌트
├── lib/
│   ├── data.ts                # 더미 데이터 (12개)
│   └── utils.ts               # 유틸리티 함수
├── types/
│   └── index.ts               # TypeScript 타입 정의
└── package.json
```

## 🛠️ 설치 및 실행

### 1단계: 프로젝트 클론 또는 파일 복사

이 프로젝트 파일들을 원하는 디렉토리에 복사합니다.

### 2단계: 의존성 설치

```bash
npm install
```

### 3단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 📦 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🎨 주요 기술 스택

- **Next.js 14**: App Router 사용
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **shadcn/ui**: 고품질 React 컴포넌트
- **Lucide React**: 아이콘 라이브러리

## 📱 반응형 브레이크포인트

- **모바일**: < 768px (1열)
- **태블릿**: 768px ~ 1024px (2열)
- **데스크탑**: ≥ 1024px (3열)

## 🔧 커스터마이징

### 더미 데이터 수정

`lib/data.ts` 파일에서 `POLICY_DATA` 배열을 수정하여 데이터를 변경할 수 있습니다.

### 색상 테마 변경

`app/globals.css` 파일에서 CSS 변수를 수정하여 색상 테마를 변경할 수 있습니다.

### 컴포넌트 스타일 수정

각 컴포넌트는 Tailwind CSS 클래스를 사용하므로, 클래스명을 수정하여 스타일을 변경할 수 있습니다.

## 📄 라이선스

MIT License

## Deployment
This project is deployed on Vercel.
