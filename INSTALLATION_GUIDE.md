# 정책 피드 프로젝트 - 완벽 설치 가이드

## 📌 시작하기 전에

이 가이드는 완전히 처음부터 프로젝트를 설정하는 방법을 단계별로 안내합니다.

### 필요한 도구
- Node.js 18.17 이상
- npm 또는 yarn

---

## 🚀 방법 1: 새 프로젝트로 시작 (권장)

### 1단계: Next.js 프로젝트 생성

터미널을 열고 다음 명령을 실행하세요:

```bash
npx create-next-app@14 policy-feed --typescript --tailwind --app --no-src-dir
```

질문이 나오면 다음과 같이 답하세요:
- ✔ Would you like to use ESLint? › **Yes**
- ✔ Would you like to use `src/` directory? › **No**
- ✔ Would you like to use App Router? › **Yes**
- ✔ Would you like to customize the default import alias (@/*)? › **No**

프로젝트 디렉토리로 이동:
```bash
cd policy-feed
```

### 2단계: 추가 패키지 설치

```bash
npm install @radix-ui/react-slot @radix-ui/react-tabs class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate
```

### 3단계: 기존 파일 교체

제공된 프로젝트 파일들로 다음 파일들을 교체하세요:

**삭제할 기본 파일:**
- `app/page.tsx` (기존 파일 삭제)
- `app/globals.css` (기존 파일 삭제)

**복사할 파일 및 디렉토리:**
```
policy-feed/
├── app/
│   ├── item/[id]/page.tsx     (새로 생성)
│   ├── globals.css            (교체)
│   ├── layout.tsx             (교체)
│   └── page.tsx               (교체)
├── components/                (전체 디렉토리 새로 생성)
├── lib/                       (전체 디렉토리 새로 생성)
├── types/                     (전체 디렉토리 새로 생성)
├── tailwind.config.ts         (교체)
├── tsconfig.json              (교체)
└── postcss.config.js          (그대로 유지)
```

### 4단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 🔄 방법 2: 제공된 파일로 직접 시작

이미 모든 파일이 준비되어 있다면:

### 1단계: 의존성 설치

```bash
npm install
```

### 2단계: 개발 서버 실행

```bash
npm run dev
```

---

## ✅ 설치 확인 체크리스트

설치가 완료되면 다음을 확인하세요:

- [ ] http://localhost:3000 접속 시 "정책 피드" 페이지가 보임
- [ ] 4개의 탭(입법예고, 공포정책, 회의/논의, 뉴스)이 표시됨
- [ ] 각 탭을 클릭하면 해당 카테고리의 카드들이 보임
- [ ] 카드를 클릭하면 상세 페이지로 이동함
- [ ] 상세 페이지에서 "뒤로가기" 버튼이 작동함
- [ ] 브라우저 창 크기를 조절하면 반응형으로 레이아웃이 변경됨

---

## 🎨 반응형 테스트

다양한 화면 크기에서 테스트하세요:

1. **모바일 뷰** (< 768px): Chrome DevTools에서 iPhone 크기로 확인
   - 카드가 1열로 표시되어야 함

2. **태블릿 뷰** (768px ~ 1024px): iPad 크기로 확인
   - 카드가 2열로 표시되어야 함

3. **데스크탑 뷰** (≥ 1024px): 일반 브라우저 창에서 확인
   - 카드가 3열로 표시되어야 함

---

## 🐛 문제 해결

### 문제: "Module not found" 에러

**해결방법:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 문제: TypeScript 에러

**해결방법:**
```bash
# TypeScript 재컴파일
npm run build
```

### 문제: Tailwind 스타일이 적용되지 않음

**해결방법:**
1. `tailwind.config.ts`의 `content` 경로 확인
2. 개발 서버 재시작: `npm run dev`

### 문제: shadcn/ui 컴포넌트 스타일 오류

**해결방법:**
1. `app/globals.css`의 CSS 변수 확인
2. `lib/utils.ts`의 `cn` 함수 확인

---

## 📦 프로덕션 빌드

개발이 완료되면 프로덕션 빌드를 만드세요:

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

---

## 🔧 추가 커스터마이징

### 더미 데이터 변경

`lib/data.ts` 파일을 열어 `POLICY_DATA` 배열을 수정하세요.

### 색상 테마 변경

`app/globals.css`에서 CSS 변수를 수정하세요:

```css
:root {
  --primary: 222.2 47.4% 11.2%;  /* 기본 색상 변경 */
  /* ... 기타 색상 */
}
```

### 새 페이지 추가

`app/` 디렉토리에 새 폴더를 만들고 `page.tsx` 파일을 추가하세요.

---

## 📚 다음 단계

- 실제 API 연동하기
- 검색 기능 추가하기
- 페이지네이션 구현하기
- 다크 모드 추가하기
- 사용자 인증 추가하기

---

## 💡 도움이 필요하신가요?

- Next.js 공식 문서: https://nextjs.org/docs
- shadcn/ui 공식 문서: https://ui.shadcn.com
- Tailwind CSS 공식 문서: https://tailwindcss.com/docs

---

이 가이드대로 진행하시면 문제없이 프로젝트를 실행하실 수 있습니다! 🎉
