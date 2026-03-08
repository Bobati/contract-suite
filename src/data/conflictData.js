// src/data/conflictData.js
// 충돌 분석 정적 데이터

export const BASIC_CONFLICTS = [
  { id:"XC-001", risk:"HIGH", type:"POTENTIAL", topic:"치유 기간", docA:"SAA §6.2 (20일)", docB:"TOS §8.2 (30일)", summary:"OF3/OF4 위반 시 어느 기간이 적용되는지에 따라 해지 유효성 자체가 달라짐.", verdict:"SAA 우선 시 20일. TOS 기준 시 30일. 불확실성 존재.", action:"Amendment로 단일화(30일 권고)." },
  { id:"XC-002", risk:"HIGH", type:"POTENTIAL", topic:"Liability Cap", docA:"SAA §8.2 ($10M)", docB:"TOS §12 ($100K)", summary:"동일 사건에서 최대 청구 금액이 최대 100배 차이. Hurdle 미달성 전 가장 큰 리스크.", verdict:"SAA 우선 시 $10M 캡 적용.", action:"즉시 Amendment로 $10M 캡 통일." },
  { id:"XC-003", risk:"HIGH", type:"POTENTIAL", topic:"준거법·중재지", docA:"SAA §9.0 (한국법/서울 ICC)", docB:"TOS §13 (영국법/런던 ICC)", summary:"OF3/OF4가 TOS를 직접 참조하므로 OF 관련 분쟁에서 영국법 주장 가능.", verdict:"SAA 우선 원칙으로 한국법/서울 ICC.", action:"즉시 Amendment로 한국법/서울 ICC 통일." },
  { id:"XC-004", risk:"HIGH", type:"POTENTIAL", topic:"서비스 즉시 정지", docA:"SAA §6.2 (20일 치유 보장)", docB:"TOS §8.4 (즉시 정지)", summary:"Palantir이 TOS §8.4로 즉시 서비스 차단 시 SAA §6.2 치유 기간이 사실상 무력화됨.", verdict:"TOS §8.4 즉시 정지가 SAA와 병존 가능. KT에 불리.", action:"Amendment로 최소 5영업일 사전 통보 의무화." },
  { id:"XC-005", risk:"HIGH", type:"POTENTIAL", topic:"OF4 해지 후 잔여 Fee", docA:"SAA §6.3 (good faith 협상)", docB:"OF4 (ratable 기준)", summary:"SAA 해지 시 잔여 Fee 처리 기준이 협상인지 비율계산인지 충돌.", verdict:"OF4 > SAA이므로 ratable 기준 원칙적 우선.", action:"Amendment로 해지 시 Fee 처리 기준 명확화." },
  { id:"XC-006", risk:"MEDIUM", type:"LAYERED", topic:"면책 중첩", docA:"SAA §8.1 (상호 면책)", docB:"TOS §9.1 (IP 면책)", summary:"IP 침해 클레임에서 두 조항 중첩 적용 가능. 충돌 아닌 보완 관계.", verdict:"IP 침해: TOS §9.1 우선. 기타: SAA §8.1 적용.", action:"현재 구조 유지. IP 클레임 시 20일 통보 엄수." },
  { id:"XC-007", risk:"MEDIUM", type:"LAYERED", topic:"비밀유지 통보", docA:"SAA §7.1 (사전 통보 의무)", docB:"TOS §6 (법적 허용 범위 내)", summary:"TOS §6이 SAA §7.1보다 Palantir에 유리한 예외 허용.", verdict:"SAA §7.1 기준(더 엄격) 우선.", action:"실무상 큰 리스크 없음." },
  { id:"XC-008", risk:"MEDIUM", type:"LAYERED", topic:"Non-Solicitation vs. 독립 개발", docA:"OF3 §2 (4년 스카우트 금지)", docB:"SAA §10.4 (독립 개발권)", summary:"Certified 직원 이직 후 Palantir 합류 시 실질적 보호 제한.", verdict:"직접 충돌 아님. 스카우트 금지 + 독립 개발 허용 병존.", action:"이직 후 1년 관련 업무 제한 조항 협상 권고." },
];

export const BASIC_INTERNAL = [
  { id:"IC-001", doc:"SAA", risk:"HIGH", topic:"독점 금지 vs. EBT", clauseA:"§1.3.2 직접 판매 금지", clauseB:"§2.10 EBT 협의", conflict:"KT 발굴 고객에 대한 Palantir 직접 계약이 위반인지 협의 대상인지 경계 불명확.", resolution:"Palantir이 먼저 접근하는 경우는 §1.3.2 위반 명시 필요." },
  { id:"IC-002", doc:"SAA", risk:"HIGH", topic:"Surviving QRC 배분율", clauseA:"§6.3 good faith 협상", clauseB:"§2.11 KT 10% / Palantir 90% 고정", conflict:"해지 시 수익 배분이 협상인지 고정인지 충돌.", resolution:"§2.11이 더 구체적 특약." },
  { id:"IC-003", doc:"SAA", risk:"MEDIUM", topic:"비독점 vs. Target Market 독점", clauseA:"§1.2 비독점 원칙", clauseB:"§1.3.1 Target Market 독점권", conflict:"비독점 선언 후 독점 부여. 범위 해석 시 긴장 관계.", resolution:"Target Market 정의(Schedule A §1.6) 엄격 적용." },
  { id:"IC-004", doc:"TOS", risk:"HIGH", topic:"즉시 정지 이중 규정", clauseA:"§8.4 즉시 정지", clauseB:"§14 Misc 즉시 정지 재규정", conflict:"TOS 내에서 동일 내용 이중 규정으로 정지 사유 범위 확대 효과.", resolution:"SAA Amendment로 정지 사유 제한 협상." },
  { id:"IC-005", doc:"OF4", risk:"MEDIUM", topic:"Azure 요금 vs. SPC 마이그레이션", clauseA:"PoC Azure Usage Rates 명시", clauseB:"SPC 마이그레이션 시 요금 재협의", conflict:"마이그레이션 시점 미정. 재협의 결렬 시 요금 기준 불명확.", resolution:"마이그레이션 일정·협의기간·중재 조항 삽입." },
];

export const EXTENDED_CONFLICTS = [
  { id:"EC-001", risk:"HIGH", category:"지급 조건", title:"TOS 연체이자 vs. 하도급법 이율", reg:"하도급지침 제8조⑤", contract:"TOS §7", regRule:"60일 초과 시 공정위 고시 이율", contractRule:"연체 시 월 1.5% (연 18%)", conflict:"하도급법 강행규정으로 TOS 배제 불가.", recommendation:"Palantir Korea 하도급법상 중소기업 해당 여부 확인." },
  { id:"EC-002", risk:"HIGH", category:"해지 절차", title:"하도급 최고 기간(1개월) vs. SAA/TOS 치유 기간", reg:"하도급지침 제8조⑦", contract:"SAA §6.2 / TOS §8.2", regRule:"중요 내용 위반 시 1개월 이상 최고 후 해지", contractRule:"SAA 20일 / TOS 30일", conflict:"하도급법 적용 시 SAA 20일 해지 통보는 법적 효력 부정 가능.", recommendation:"Amendment로 해지 기간을 법령상 최소 기간 중 긴 것으로 수정." },
  { id:"EC-003", risk:"HIGH", category:"정보보안", title:"Azure 클라우드 도입 vs. CISO 보안성 승인 의무", reg:"정보보호지침 제43조", contract:"OF4 Cloud Infrastructure", regRule:"신규 정보시스템 구축 전 CISO 보안성 승인 필수", contractRule:"OF4: PoC Azure 환경 사용 및 SPC Azure 마이그레이션", conflict:"CISO 승인 없이 서비스 시작 시 내규 위반. CISO가 서비스 중단 요구 가능.", recommendation:"즉시 CISO 보안성 승인 절차 완료 여부 확인." },
  { id:"EC-004", risk:"HIGH", category:"정보보안", title:"가급 정보자산 외부 제공 vs. Palantir 플랫폼 데이터 처리", reg:"정보보호지침 제44조", contract:"TOS §3 / OF4 Cloud", regRule:"가급 자산 외부 유출 시 부문정보보안관리자 사전승인 필수", contractRule:"KT Customer Data를 Palantir Azure에 업로드", conflict:"사전승인 없이 업로드 시 내규 위반 + 개인정보보호법 위반 가능성.", recommendation:"업로드 데이터 보안등급 분류 실시." },
  { id:"EC-005", risk:"HIGH", category:"예산 집행", title:"OF4 즉시 지급($4M) vs. 예산 집행 원칙", reg:"회계규정 제30조", contract:"OF4 (Upon Execution: $4M)", regRule:"지출은 성립된 예산 범위 내. 초과 시 재무실 사전 협의 필수", contractRule:"계약 즉시 $4M 지급, 5년 총 $27M", conflict:"2025년도 예산에 $4M 미편성 시 회계규정 위반.", recommendation:"각 연도별 지급금액 예산 편성 여부 확인." },
  { id:"EC-006", risk:"MEDIUM", category:"협력사 등록", title:"Palantir Korea 협력사 등록 요건 충족 여부", reg:"협력사선정지침 제4조", contract:"SAA / OF3 / OF4 전반", regRule:"협력사 등록: 신용등급 B- 이상 + TL9000/ISO9001 인증", contractRule:"Palantir Korea LLC를 핵심 솔루션 공급 협력사로 취급", conflict:"외국계 법인의 KT 협력사 등록 여부 불명확.", recommendation:"Palantir Korea 협력사 등록 현황 즉시 확인." },
  { id:"EC-007", risk:"MEDIUM", category:"계약 체결", title:"수의계약 집행 요건 vs. SAA/OF 체결 방식", reg:"계약규정 제18조", contract:"SAA / OF3 / OF4", regRule:"수의계약은 특정 기술·특허·단일 생산자 해당 시만 가능", contractRule:"$86M 규모 경쟁입찰 없이 단독 계약 체결", conflict:"수의계약 근거 없이 체결 시 계약규정 위반. 감사 지적 가능.", recommendation:"수의계약 집행 근거 문서화 및 계약담당 결재 이력 확보." },
  { id:"EC-008", risk:"MEDIUM", category:"서면 요건", title:"이메일·구두 합의 효력 vs. 하도급 서면 의무", reg:"하도급지침 제9조", contract:"SAA Amendment 전반", regRule:"계약 변경 사항 서면 발급 및 보존 의무.", contractRule:"이메일 합의도 계약 변경으로 인정되는 실무 관행", conflict:"이메일 합의가 하도급법상 서면 요건을 충족하는지 불명확.", recommendation:"중요 변경 사항은 공식 Amendment 서면으로 처리." },
  { id:"EC-009", risk:"MEDIUM", category:"내부 승인", title:"OF3 Enablement Program 도급 해당 시 대표이사 승인", reg:"도급관리지침 제4조", contract:"OF3 ($9M Enablement Program)", regRule:"도급 계약 체결은 사업부서별 대표이사 승인 필요", contractRule:"OF3: Palantir이 KT 직원에게 3단계 교육 제공 $9M 용역", conflict:"도급 해당 시 대표이사 승인 없는 계약 체결은 내규 위반.", recommendation:"OF3 도급 해당 여부 법무팀 검토." },
  { id:"EC-010", risk:"LOW", category:"서면 요건", title:"계약서 필수 기재사항 vs. 준거법 미기재", reg:"계약규정 제36조", contract:"OF3 / OF4", regRule:"계약서에 계약목적·금액·이행기간·지체상금 기재 필수", contractRule:"OF3/OF4는 TOS 참조로 준거법·분쟁해결 간접 적용", conflict:"준거법이 영국법으로 적용될 경우 KT 법무팀 검토 범위 벗어난 리스크.", recommendation:"OF3/OF4 계약 체결 시 TOS §13 영국법 검토 이력 확인." },
];

export const STATIC_AMENDMENTS = [
  { id:"AMD-001", date:"2025.03.12", title:"Order Form #4 체결", type:"addition", status:"active", summary:"내부 라이선스 $27M 추가. 편의해지 불가 조항 포함.", affects:["SAA","OF4"], resolves:[], source:"static" },
  { id:"AMD-002", date:"2025.06.03", title:"Order Form #3 체결", type:"addition", status:"active", summary:"Enablement Program $9M 추가. SAA의 Hurdle 달성 목적 연계.", affects:["SAA","OF3"], resolves:[], source:"static" },
];

export const DOCUMENTS = [
  { id:"SAA", name:"SAA", fullName:"Strategic Alliance Agreement", type:"contract", layer:"A", clauses:14, risk:"HIGH", date:"2025.03.12" },
  { id:"OF3", name:"Order Form #3", fullName:"Enablement Program $9M", type:"contract", layer:"A", clauses:3, risk:"MEDIUM", date:"2025.06.03" },
  { id:"OF4", name:"Order Form #4", fullName:"Platform License $27M", type:"contract", layer:"A", clauses:2, risk:"HIGH", date:"2025.03.12" },
  { id:"TOS", name:"TOS", fullName:"Terms of Service", type:"contract", layer:"A", clauses:5, risk:"HIGH", date:"참조 문서" },
  { id:"REG01", name:"계약규정", fullName:"K사 계약규정", type:"regulation", layer:"B", clauses:5, risk:"MEDIUM", date:"내규" },
  { id:"REG02", name:"회계규정", fullName:"K사 회계규정", type:"regulation", layer:"B", clauses:3, risk:"MEDIUM", date:"내규" },
  { id:"REG03", name:"회계업무지침", fullName:"K사 회계업무지침", type:"regulation", layer:"B", clauses:2, risk:"LOW", date:"내규" },
  { id:"REG04", name:"정보보호지침", fullName:"K사 정보보호업무처리지침", type:"regulation", layer:"B", clauses:3, risk:"HIGH", date:"내규" },
  { id:"REG05", name:"협력사선정지침", fullName:"K사 협력사선정운용지침", type:"regulation", layer:"B", clauses:2, risk:"MEDIUM", date:"내규" },
  { id:"REG06", name:"하도급지침", fullName:"K사 하도급거래계약체결업무지침", type:"regulation", layer:"B", clauses:4, risk:"HIGH", date:"내규" },
  { id:"REG07", name:"도급관리지침", fullName:"K사 도급계약관리지침", type:"regulation", layer:"B", clauses:2, risk:"MEDIUM", date:"내규" },
];

export const DOC_OPTIONS = ["SAA","OF3","OF4","TOS","계약규정","회계규정","정보보호지침","하도급지침","협력사선정지침","도급관리지침","회계업무지침"];

// ─── AMD PARSE PROMPT ────────────────────────────────────────────────────────

export const RISK_CONFIG = {
  HIGH:   { bg:"#ff2d20", label:"HIGH" },
  MEDIUM: { bg:"#f59e0b", label:"MED" },
  LOW:    { bg:"#10b981", label:"LOW" },
};

export const CATEGORY_COLOR = {
  "지급 조건":"#6366f1","해지 절차":"#ef4444","정보보안":"#0ea5e9",
  "예산 집행":"#f59e0b","협력사 등록":"#8b5cf6","계약 체결":"#ec4899",
  "서면 요건":"#14b8a6","내부 승인":"#f97316",
};

