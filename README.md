# Seongbeom Yeon — Research Portfolio

반도체 나노소재 연구를 소개하는 개인 포트폴리오 정적 웹사이트입니다.
빌드 도구·프레임워크·서버 없이 순수 HTML + CSS + ES Module JavaScript로만 구성되어,
브라우저에서 바로 열리고 GitHub Pages로 그대로 배포됩니다.

## 페이지 구성

| 페이지 | 파일 | 내용 |
|---|---|---|
| Home | `index.html` | 소개, 논문 목록, 인용 지표(Google Scholar), 각 섹션 프리뷰 |
| Research Follow | `research-follow.html` | 최근 3일 내 주요 저널 신규 논문을 Crossref API로 자동 수집 |
| Research Tools | `research-visualizations.html` | 인터랙티브 계산기 (Band-gap, S/V Ratio, Electron Cloud) |

## 아키텍처

레이어드 구조입니다. 각 페이지의 진입점(`js/pages/`)이 기능 모듈(`js/features/`)을 조립하고,
기능 모듈은 순수 계산/유틸(`js/utils/`)과 정적 데이터(`js/data/`)만 참조합니다.
의존 방향은 항상 아래로만 흐릅니다: **pages → features → utils / data**

```
index.html ─────────────── js/pages/home.js
                             ├─ features/publications.js ─── data/publications.js
                             ├─ features/citations.js ────── citations.json (fetch)
                             └─ utils/footer-year.js

research-follow.html ───── js/pages/research-follow-page.js
                             ├─ features/research-follow.js
                             │    ├─ data/watchlist-config.js   (저널·키워드 목록)
                             │    ├─ utils/crossref.js          (Crossref API 호출)
                             │    ├─ utils/dates.js
                             │    └─ utils/format.js
                             └─ utils/footer-year.js

research-visualizations.html ─ js/pages/research-visualizations-page.js
                             ├─ features/tab-layout.js
                             ├─ features/quantum-confinement-calculator.js
                             │    ├─ data/materials.js          (물질 상수·문헌 출처)
                             │    ├─ utils/brus-equation.js     (Brus equation 물리 계산)
                             │    ├─ utils/wavelength-color.js  (파장→색 변환)
                             │    └─ utils/chart-math.js        (SVG 차트 좌표 계산)
                             ├─ features/surface-volume-calculator.js
                             │    ├─ data/morphologies.js       (형태별 파라미터 정의)
                             │    ├─ utils/geometry-formulas.js (표면적/부피 공식)
                             │    └─ utils/morphology-diagrams.js (형태 다이어그램 SVG)
                             ├─ features/electron-cloud-viewer.js
                             │    ├─ data/molecule-presets.js   (SMILES 프리셋 목록)
                             │    ├─ utils/rdkit-loader.js      (RDKit.js WASM 지연 로딩)
                             │    ├─ utils/mol-json.js          (분자 구조 JSON 파싱)
                             │    ├─ utils/gasteiger.js         (Gasteiger charge 계산)
                             │    │    └─ data/gasteiger-parameters.js
                             │    └─ utils/charge-color.js      (전하→색 변환)
                             └─ utils/footer-year.js
```

### 레이어 규칙

- **`js/pages/`** — 페이지당 1개. init 함수 호출만 하고 로직을 갖지 않는다.
- **`js/features/`** — DOM을 읽고 그리는 화면 로직. 계산은 직접 하지 않고 utils에 위임한다.
- **`js/utils/`** — DOM을 모르는 순수 함수(물리 공식, 포맷터, API 클라이언트). 단독 테스트 가능.
  (예외: `rdkit-loader.js`는 CDN 스크립트 태그 주입을 위해 `document`에 접근한다.)
- **`js/data/`** — 물질 상수, 논문 목록, 워치리스트 등 정적 데이터. 코드 로직 없음.

이 분리 덕분에 "InP 유전율 값만 바꿔줘" 같은 수정은 `js/data/materials.js` 한 파일,
"Brus 식 계산 확인해줘"는 `js/utils/brus-equation.js` 한 파일만 보면 됩니다.

## 폴더 트리

```
.
├── index.html                     # Home
├── research-follow.html           # Research Follow
├── research-visualizations.html   # Research Tools (계산기)
├── citations.json                 # 인용 지표 데이터 (Actions가 주기 갱신)
├── css/
│   └── styles.css                 # 전체 사이트 단일 스타일시트
├── js/
│   ├── pages/                     # 페이지 진입점 (조립만)
│   ├── features/                  # 화면 렌더링·이벤트 로직
│   ├── utils/                     # 순수 계산·유틸 함수 (DOM 비의존)
│   └── data/                      # 정적 데이터 (상수·목록)
├── scripts/
│   └── update-citations.mjs       # Scholar 인용 지표 수집 스크립트 (Node)
├── .github/workflows/
│   └── update-citations.yml       # 주 1회 인용 지표 자동 갱신
└── docs/
    └── brainstorming.md           # 초기 기획·브레인스토밍 기록
```

## 워크플로우

### 로컬에서 실행

ES Module을 쓰므로 `file://`이 아닌 로컬 서버로 열어야 합니다.

```sh
python -m http.server 8000
# 또는: npx serve .
```

브라우저에서 `http://localhost:8000` 접속.

### 배포 (GitHub Pages)

별도 빌드 없이 저장소 루트를 그대로 서빙합니다. `main` 브랜치에 push하면 반영됩니다.

### 인용 지표 자동 업데이트

- `.github/workflows/update-citations.yml`이 **매주 일요일 20:00 UTC**에 실행 (수동 실행도 가능).
- `scripts/update-citations.mjs`가 Google Scholar(또는 `SERPAPI_KEY` 시크릿이 있으면 SerpApi)에서
  지표를 가져와 `citations.json`을 갱신하고 자동 커밋합니다.
- 홈 화면은 `citations.json`을 fetch해 표시하며, 실패 시 HTML에 하드코딩된 마지막 스냅샷을 그대로 보여줍니다.

### 자주 하는 콘텐츠 수정

| 하고 싶은 일 | 수정할 파일 |
|---|---|
| 논문 추가/수정 | `js/data/publications.js` |
| 계산기 물질 추가 (상수·유효 범위·출처) | `js/data/materials.js` |
| 워치리스트 저널/키워드 변경 | `js/data/watchlist-config.js` |
| 나노입자 형태 추가 | `js/data/morphologies.js` + `js/utils/geometry-formulas.js` + `js/utils/morphology-diagrams.js` |
| Electron Cloud 분자 프리셋 추가 | `js/data/molecule-presets.js` |
| 스타일 변경 | `css/styles.css` (CSS 변수는 최상단 `:root`) |

### 개발 사이클

1. 수정 → 로컬 서버에서 세 페이지 확인
2. 물리/화학 값 변경 시 문헌 출처를 `referenceNote`에 함께 기록
3. push → GitHub Pages 자동 반영
