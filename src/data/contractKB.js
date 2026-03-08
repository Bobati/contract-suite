// src/data/contractKB.js
// KT-Palantir 계약 Knowledge Base
// 배포 시 이 파일을 DB나 API로 교체할 수 있습니다.

export CLAUSE_FULLTEXT = {
  "SAA-1.3.1": {
    doc:"SAA", section:"Section 1.3.1", title:"Exclusivity — Grant to Partner",
    text:``,
    context:"독점권 조항. KT가 한국 내 금융·보험 분야에서 Palantir Products를 독점적으로 재판매·배포할 권리를 갖는 근거. 적시 지급 조건 미충족 시 독점권 효력이 문제될 수 있음.",
    translation:`계약 기간 동안, Palantir은 KT에게 Territory(대한민국) 내 Target End Customers에 대한 **독점적 재판매·배포 권한**을 부여한다. 단, KT가 해당 Order Form에 명시된 **지급 의무를 적시에 이행**하는 것을 조건으로 한다.

명확히 하자면, 본 조에 따른 독점권은 **Schedule A에 정의된 Target Market(금융서비스·보험)에만 적용**되며, Palantir이 Territory 내에서 Other Market(§1.6.8)과 관련된 활동을 하는 것을 제한하지 않는다.

[Schedule A 정의] "Target Market"이라 함은 **금융서비스(투자은행, 자산관리, 회계법인) 및 보험사**로서 Appendix 6에 등재된 자를 의미한다.`
  },
  "SAA-1.3.2": {
    doc:"SAA", section:"Section 1.3.2", title:"Exclusivity — Palantir Restrictions",
    text:``,
    context:"Palantir의 직접 판매 금지 조항. KT 동의 없이 Target Market에서 직접 판매하거나 제3자 파트너를 선임하는 행위 금지. IC-001 충돌의 핵심.",
    translation:`계약 기간 동안, Palantir은 KT의 사전 서면 동의 없이 다음 행위를 할 수 없다:
(a) **Territory 내 Target End Customers에게 Palantir Products를 직접 판매·배포하는 행위**
(b) Territory 내 Target End Customers 대상으로 판매·배포 권한을 가진 제3자 재판매자·배포자·대리인을 선임하는 행위
(c) 제3자에게 Territory 내 Target End Customers 대상 재판매·배포권을 부여하는 사업 제휴를 체결하는 행위
(d) 위 독점권과 충돌하는 방식으로 사업 구조를 개편하는 행위

다만, 다음은 위 제한의 예외로 한다:
(i) **§1.6.8에 따른 Other Market 관련 활동**
(ii) **§2.10에 따른 Extraordinary Bilateral Transaction(EBT) 이행 의무**`
  },
  "SAA-1.6.8": {
    doc:"SAA", section:"Section 1.6.8", title:"Other Market — Marketing Restrictions",
    text:``,
    context:"Other Market 마케팅 제한. 이 조항 위반이 곧 material breach → SAA §6.2 해지 사유로 연결되는 핵심 조항. Palantir 경고의 직접적 법적 근거.",
    translation:`본 계약의 다른 조항에도 불구하고, KT는 Palantir의 사전 서면 동의 없이, 다음 조건을 **모두** 충족하는 법인을 대상으로 적극적으로 마케팅하거나 영업을 권유할 수 없다:
(a) **Appendix 7에 승인된 Other Market 고객으로 등재되지 않은 법인**
(b) 주된 사업이 Other Market에 속하는 법인

본 조에서 '적극적 마케팅(active marketing)'에는 다음이 포함된다(단, 이에 한정되지 않음):
• 직접 권유(direct solicitation)
• 타깃 광고 캠페인(targeted advertising campaigns)
• 무요청 제안서 발송(unsolicited proposals)
• 해당 법인이 개시한 조달 절차 참여

**이 조항 위반은 §6.2 적용상 "material breach(중대한 위반)"에 해당**하며, Palantir은 치유 기간을 부여한 후 계약을 해지할 수 있다.

[현재 Appendix 7 등재 고객(10개사)] 현대자동차, 기아, 포스코, 한화시스템, 현대로템, 현대글로비스, CJ제일제당, 한국해양진흥공사, 서울아산병원, 산업통상자원부`
  },
  "SAA-2.10": {
    doc:"SAA", section:"Section 2.10", title:"Extraordinary Bilateral Transaction",
    text:``,
    context:"KT가 발굴한 고객에 Palantir이 직접 접근하는 경우의 처리 절차. '삼성전자 직접 접촉' 시나리오에서 핵심 조항. IC-001 충돌과 직결.",
    translation:`Palantir이 Territory 내에서 KT의 독점권(§1.3.1) 범위에 해당하는 잠재 고객과 독자적으로 사업 기회를 발굴·개발하는 경우("Extraordinary Bilateral Transaction", EBT), Palantir은 다음 절차를 이행해야 한다:
(a) **해당 기회를 KT에 서면으로 즉시 통보**
(b) 해당 거래의 구조에 관해 KT와 **성실히(good faith) 협상**
(c) 합리적인 상업 조건으로 KT에 **참여권(participation right) 제공**

**Palantir의 최초 통보 후 30일 이내에 합의가 이루어지지 않을 경우**, Palantir은 비독점 방식으로 해당 거래를 진행할 수 있다. 단, 이 경우 **최초 계약 기간 동안 해당 거래에서 발생한 순수익의 [REDACTED]%를 KT에 소개 수수료(referral fee)로 지급**해야 한다.`
  },
  "SAA-2.11": {
    doc:"SAA", section:"Section 2.11", title:"Surviving QRC Revenue Allocation",
    text:``,
    context:"계약 종료 후 잔여 수익(Surviving QRC) 배분율. KT 10% / Palantir 90% 고정. IC-002에서 SAA §6.3의 good faith 협상 조항과 충돌.",
    translation:`계약 종료 또는 만료 시, 종료일 현재 계약은 체결되었으나 수익이 아직 인식되지 않은 QRC("Surviving QRC")에 대해, 양 당사자는 다음 수익 배분에 합의한다:

(a) **KT는 종료일 이후 24개월간 Palantir이 Surviving QRC 고객으로부터 실제 수령한 순수익의 10%를 수취**한다
(b) **Palantir은 해당 순수익의 90%를 보유**한다
(c) Palantir은 해당 기간 동안 Surviving QRC 고객에 관한 **분기별 수익 보고서를 KT에 제공**해야 한다

위 배분 조건은 Surviving QRC 수익에 관한 **당사자 간의 다른 모든 수익 배분 약정에 우선하여 적용**된다.

※ 핵심 쟁점: SAA §6.3은 good faith 협상을 규정하나 §2.11은 10/90을 고정 → **IC-002 충돌**`
  },
  "SAA-6.2": {
    doc:"SAA", section:"Section 6.2", title:"Termination for Material Breach",
    text:``,
    context:"계약 해지의 핵심 조항. 20일 치유 기간 부여. Other Market 마케팅 위반을 명시적 material breach로 규정. XC-001(vs TOS 30일), EC-002(vs 하도급법 1개월)의 중심 조항.",
    translation:`일방 당사자가 본 계약의 **중요한 의무(material breach)**를 위반한 경우, 상대방은 위반의 성격을 합리적으로 특정한 **서면 통지**를 해야 한다.

서면 통지를 수령한 당사자는 수령일로부터 **20일(치유 기간, Cure Period) 이내에 해당 위반을 치유**해야 한다.

치유 기간 내에 위반을 치유하지 못한 경우, **통지를 발송한 당사자는 계약을 해지**할 수 있다.

※ 핵심 쟁점 — XC-001:
• TOS §8.2는 **30일** 치유 기간을 규정 → 어느 쪽이 우선하는지 충돌
• TOS §8.4는 **사전 통보 없이 즉시 서비스 정지**를 허용 → 이 조항의 치유 기간을 사실상 우회 가능
• 문서 우선순위 원칙상 SAA가 TOS보다 상위이나, 실무상 TOS가 먼저 적용될 위험 존재`
  },
  "SAA-6.3": {
    doc:"SAA", section:"Section 6.3", title:"Effect of Termination — Revenue and Obligations",
    text:``,
    context:"해지 효과 및 잔여 수익 처리. good faith 협상 원칙이나, KT material breach로 해지 시 §2.11 고정 배분 적용 가능. IC-002의 핵심.",
    translation:`계약의 해지 또는 만료 시에도 일정 의무는 존속한다.

**Hurdle(총 수익 목표 USD 55,000,000) 미달성 상태에서 계약이 해지될 경우**, 양 당사자는 Surviving QRC(계약 체결되었으나 수익 미인식 잔여 계약)의 수익 처리 방식에 관해 **good faith(성실한 방법으로) 협상할 의무**를 진다.

※ 핵심 쟁점 — IC-002:
• §2.11은 KT 10% / Palantir 90% 고정 배분을 규정
• §6.3은 good faith 협상을 요구
• 두 조항이 충돌하여 해지 시 수익 배분 기준이 불명확함`
  },
  "SAA-8.2": {
    doc:"SAA", section:"Section 8.2", title:"Limitation of Liability",
    text:``,
    context:"책임 한도 조항. max(12개월 Partner Compensation, $10M). XC-002에서 TOS §12의 $100K 한도와 충돌 — 어느 문서가 우선하느냐에 따라 100배 차이.",
    translation:`어느 당사자도 본 계약 또는 이와 관련하여 **USD $10,000,000(1,000만 달러)를 초과하는 금액**에 대해 손해배상 책임을 지지 않는다.

단, 다음의 경우는 위 상한의 예외로 한다:
(i) **사망 또는 신체상해**로 인한 청구
(ii) **고의적 위법행위 또는 중과실**로 인한 청구
(iii) **비밀유지 의무(§7.1) 위반**으로 인한 청구

※ 핵심 쟁점 — XC-002:
• TOS §12는 최대 **USD $100,000(10만 달러)** 상한을 규정
• SAA $10M vs TOS $100K → **최대 100배 차이**
• 문서 우선순위상 SAA가 상위이나, Palantir이 TOS 적용을 주장할 경우 분쟁 발생`
  },
  "SAA-9.0": {
    doc:"SAA", section:"Section 9", title:"Governing Law and Dispute Resolution",
    text:``,
    context:"준거법·중재지. 한국법·서울 ICC. XC-003에서 TOS §13(영국법·런던 ICC)과 직접 충돌 — OF3/OF4가 TOS를 참조하므로 OF 관련 분쟁 시 어느 기준이 적용되는지 불명확.",
    translation:`본 계약의 성립, 유효성, 해석 및 이행은 **대한민국 법률**에 의해 규율된다.

본 계약과 관련하여 발생하는 모든 분쟁은 **서울 소재 ICC(국제상업회의소) 중재**를 통해 최종적이고 구속력 있게 해결한다. 중재 언어는 **영어**로 한다.

※ 핵심 쟁점 — XC-003:
• TOS §13은 **영국법** 및 **런던 ICC 중재**를 지정
• SAA(한국법·서울) vs TOS(영국법·런던) 직접 충돌
• 문서 우선순위상 SAA가 상위이나, TOS §13이 별도 독립 조항이라는 주장 가능
• 분쟁 발생 시 준거법·중재지 자체가 최초 쟁점이 되는 심각한 구조적 문제`
  },
  "OF3-FEES": {
    doc:"OF3", section:"Order Form #3 — Fees", title:"Enablement Program 지급 조건",
    text:``,
    context:"OF3 지급 조건. $9M 인보이스 즉시 발행, 30일 내 지급. $3M 할인은 OF2 파트너십 목적에 연동. EC-001(연체이자 충돌)의 기초.",
    translation:`KT는 Enablement Program에 대해 **USD $9,000,000(900만 달러)**를 Palantir의 인보이스 수령 후 **30일 이내**에 지급해야 한다.

지급 기한 초과 시 TOS §7에 따른 **월 1.5%(연 18%)의 연체이자**가 부과된다.

하도급지침 제8조에 따른 **공정위 고시 이율(연 15.5%)과 충돌** 가능성 있음(EC-001).`
  },
  "OF4-FEES": {
    doc:"OF4", section:"Order Form #4 — Billing Details", title:"Platform License 지급 일정",
    text:``,
    context:"OF4 지급 일정. 즉시 $4M 포함 5년 $27M. 편의해지 절대 불가. EC-005(예산 집행 원칙 충돌)의 핵심 조항.",
    translation:`KT는 Platform License에 대해 다음과 같이 지급해야 한다:
• **계약 즉시: USD $4,000,000(400만 달러)**
• **이후 연간: USD $5,000,000~$6,000,000(500~600만 달러)**
• **5년 총액: USD $27,000,000(2,700만 달러)**

**편의해지(termination for convenience) 불가** 조항 포함 — KT는 사업상 이유로 일방적 해지 후 잔여 금액 면제를 받을 수 없음.

※ 핵심 쟁점: 즉시 지급 $4M이 기존 예산 편성 범위를 초과하는지 여부(EC-005, 회계규정 제30조).`
  },
  "OF4-CLOUD": {
    doc:"OF4", section:"Order Form #4 — Infrastructure", title:"Azure Cloud Infrastructure",
    text:``,
    context:"Azure 클라우드 인프라 조항. EC-003(CISO 승인), EC-004(가급 자산 통제)의 직접 계약 근거. SPC 마이그레이션 시 요금 재협의 조항 포함.",
    translation:`PoC(개념 검증, Proof of Concept) 단계에서 **Microsoft Azure Cloud Infrastructure**를 사용한다.

SPC(Special Purpose Company, 특수목적법인)로의 마이그레이션이 발생하는 경우 클라우드 인프라 요금 구조를 **재협의**한다.

※ 핵심 쟁점 — EC-003:
• KT 정보보호지침 제43조에 따라 **신규 정보시스템 도입 전 CISO 보안성 승인 필수**
• OF4에 따른 Azure 즉시 사용 의무와 충돌
• CISO 승인 없이 Azure 도입 시 내규 위반 → TOS §8.4의 '법적 준수 위반'으로 해석되어 즉시 서비스 정지 사유가 될 수 있음`
  },
  "TOS-7": {
    doc:"TOS", section:"Section 7", title:"Fees and Payment / Late Payment",
    text:``,
    context:"연체이자 조항. 월 1.5%(연 18%). EC-001에서 하도급법 공정위 고시 이율(연 약 15.5%)과 충돌. 하도급법이 강행규정이므로 적용 우선순위 검토 필요.",
    translation:`KT가 TOS에 따른 지급 기한을 준수하지 못하는 경우, **연체 금액 전액에 대해 월 1.5%(연 환산 18%)의 연체이자**가 자동으로 부과된다.

※ 핵심 쟁점 — EC-001:
• 하도급거래 공정화에 관한 법률 시행령 및 공정거래위원회 고시에 따른 법정 이율은 **연 15.5%**
• TOS §7의 연 18%는 이보다 높아 **하도급법 강행규정과 충돌**
• 하도급법 적용 시 초과분(2.5%p) 청구가 무효가 될 수 있음
• Palantir이 한국 하도급법 적용 대상인지 여부가 선결 쟁점`
  },
  "TOS-8.2": {
    doc:"TOS", section:"Section 8.2", title:"Termination for Cause",
    text:``,
    context:"TOS 해지 조항. 30일 치유 기간. XC-001에서 SAA §6.2(20일)와 충돌. 단, 충돌 시 OF/SAA 우선 원칙에 따라 SAA §6.2(20일)가 적용되어야 함.",
    translation:`Palantir은 KT가 본 약관의 중요한 조항을 위반하고, **서면 통보 후 30일 이내에 위반을 치유하지 않을 경우** 계약을 해지할 수 있다.

※ 핵심 쟁점 — XC-001:
• **SAA §6.2는 20일** 치유 기간을 규정하여 직접 충돌
• 문서 우선순위(Order Form > SAA > TOS)상 SAA의 20일이 우선 적용되어야 하나, Palantir이 TOS의 30일을 주장할 경우 분쟁 발생
• TOS §8.4의 즉시 정지 조항이 이 치유 기간 자체를 우회할 수 있음(XC-004)`
  },
  "TOS-8.4": {
    doc:"TOS", section:"Section 8.4", title:"Suspension of Services",
    text:``,
    context:"서비스 즉시 정지 조항. KT 위반·연체 30일·보안 리스크 시 사전 통보 없이 즉시 정지 가능. XC-004에서 SAA §6.2 치유 기간을 사실상 우회하는 문제.",
    translation:`Palantir은 KT가 다음에 해당하는 경우 **사전 통보 없이 즉각적으로 서비스를 정지**할 수 있다:
(i) **TOS에 따른 지급 의무 위반**
(ii) **보안 위험을 초래하는 행위**
(iii) **적용 법령 또는 규정 준수 의무 위반**

※ 핵심 쟁점 — XC-004 (KT에 매우 불리한 핵심 조항):
• **SAA §6.2의 20일 치유 기간을 사실상 우회**하는 조항
• KT가 위반 사실을 인지하고 치유할 기회 없이 서비스가 즉시 중단될 수 있음
• '보안 위험' 및 '법령 준수 위반'의 정의가 불명확하여 Palantir의 자의적 적용 가능성
• 실무적으로 서비스 중단은 KT 사업에 즉각적·치명적 영향을 미침`
  },
  "TOS-12": {
    doc:"TOS", section:"Section 12", title:"Limitation of Liability (TOS)",
    text:``,
    context:"TOS 책임 한도. max(12개월 Fee, $100K). XC-002에서 SAA §8.2($10M)와 최대 100배 차이. SAA가 상위 문서이므로 SAA §8.2($10M)가 우선 적용되어야 하나, OF3/OF4가 TOS를 직접 참조하는 구조로 인해 불확실성 존재.",
    translation:`본 약관에 따른 Palantir의 배상 책임 총액은 다음 중 **큰 금액**을 초과할 수 없다:

• 청구 원인 발생 직전 **12개월간 KT가 Palantir에 실제 지급한 Order Form 금액**
• **USD $100,000(10만 달러)**

단, 다음의 경우는 위 상한의 예외이다:
• KT의 IP 침해에 따른 Palantir의 면책 의무(§9.1)
• 사망·신체상해

※ 핵심 쟁점 — XC-002 (구조적 핵심 충돌):
• **SAA §8.2: USD $10,000,000(1,000만 달러) 상한**
• **TOS §12: USD $100,000(10만 달러) 상한**
• **최대 100배 차이** — 실제 손해 발생 시 적용 조항에 따라 결과가 완전히 달라짐
• 문서 우선순위상 SAA $10M이 적용되어야 하나, Palantir이 TOS §12 적용을 주장할 경우 분쟁`
  },
  "TOS-13": {
    doc:"TOS", section:"Section 13", title:"Governing Law (TOS)",
    text:``,
    context:"TOS 준거법·중재지. 영국법·런던 ICC. XC-003에서 SAA §9.0(한국법·서울 ICC)과 직접 충돌. OF3/OF4가 TOS를 참조하므로 OF 관련 분쟁에서 어느 기준이 적용되는지 불명확.",
    translation:`본 약관은 **영국법(laws of England and Wales)**에 의해 규율되며, 동 법에 따라 해석된다.

본 약관과 관련된 모든 분쟁은 **런던 소재 ICC(국제상업회의소) 중재**를 통해 최종 해결한다.

※ 핵심 쟁점 — XC-003 (구조적 핵심 충돌):
• **SAA §9.0: 대한민국 법률 + 서울 ICC**
• **TOS §13: 영국법 + 런던 ICC**
• 두 문서가 완전히 다른 준거법과 중재지를 규정
• 분쟁 발생 시 **준거법·중재지 결정 자체가 최초 쟁점**이 되는 심각한 구조적 문제
• 어느 국가 법원에 소를 제기해야 하는지도 불명확`
  },
  "REG-하도급-8조": {
    doc:"하도급지침", section:"제8조⑤", title:"합리적인 대금지급 기일 결정",
    text:``,
    context:"하도급법상 지급기한 및 연체이자. EC-001에서 TOS §7 월 1.5%(연 18%)와 충돌. 하도급법은 강행규정으로 Palantir Korea가 중소기업인 경우 공정위 이율이 우선 적용됨.",
    translation:`원사업자(KT)는 수급사업자(Palantir)에게 목적물 수령일로부터 **60일 이내에 하도급대금을 지급**해야 한다.

60일 초과 지연 시, **공정거래위원회 고시 이율(현행 연 15.5%)에 따른 지연이자** 지급 의무가 발생한다.

※ 핵심 쟁점: TOS §7의 월 1.5%(연 18%) 연체이율과 충돌(EC-001). 하도급법은 강행법규이므로 계약 조항에도 불구하고 우선 적용될 수 있음.`
  },
  "REG-하도급-8조⑦": {
    doc:"하도급지침", section:"제8조⑦", title:"계약 해제·해지 절차",
    text:``,
    context:"하도급법상 해지 최고 기간. 중요 내용 위반 시 1개월 이상 최고 필수. EC-002에서 SAA §6.2(20일), TOS §8.2(30일)와 충돌. 하도급법 강행규정으로 SAA 20일 해지가 법적으로 무효화될 수 있음.",
    translation:`원사업자(KT)가 하도급계약의 **중요한 내용을 위반**한 경우, 수급사업자(Palantir)는 **1개월 이상의 기간을 정하여 이행을 최고(催告)**한 후 계약을 해지할 수 있다.

※ 핵심 쟁점: SAA §6.2(20일), TOS §8.2(30일)와의 충돌(EC-002). 하도급법의 1개월 최고 기간이 더 길어, 하도급법 적용 시 Palantir의 해지 가능 시점이 늦어질 수 있음.`
  },
  "REG-정보보호-43조": {
    doc:"정보보호지침", section:"제43조", title:"보안성 승인",
    text:``,
    context:"CISO 보안성 승인 의무. EC-003의 핵심 내규 조항. Azure 클라우드 도입 전 CISO 승인이 없었다면 내규 위반. CISO가 서비스 중단을 요구할 수 있어 OF4 계약상 의무와 충돌 가능.",
    translation:`KT의 임직원 및 협력업체는 **신규 정보시스템 구축·도입 전에 반드시 CISO(정보보호최고책임자)의 보안성 검토·승인**을 받아야 한다.

승인 없이 시스템을 구축하거나 외부 서비스를 도입하는 것은 지침 위반에 해당한다.

※ 핵심 쟁점: OF4에 따른 Azure Cloud Infrastructure 즉시 사용과 충돌(EC-003). CISO 승인 없이 진행 시 KT 내규 위반이 되며, 이것이 TOS §8.4의 '법적 준수 의무 위반'으로 해석되어 서비스 즉시 정지 사유가 될 수 있음.`
  },
  "REG-정보보호-44조": {
    doc:"정보보호지침", section:"제44조", title:"정보자산의 분류 및 통제",
    text:``,
    context:"가급 정보자산 외부 제공 통제. EC-004의 핵심 내규 조항. KT 고객 데이터를 Palantir Azure에 업로드 시 가급 해당 가능성. 부문정보보안관리자 사전승인 없이 업로드하면 내규 위반 + 개인정보보호법 위반 가능.",
    translation:`KT의 **'가급' 정보자산**은 외부 법인·개인에게 제공하기 전 **부문정보보안관리자의 사전 서면 승인**을 받아야 한다.

무단 외부 제공 시 보안 사고 책임 및 징계 대상이 될 수 있다.

※ 핵심 쟁점: Palantir에 KT 고객 데이터를 제공하거나 Azure에 업로드하는 행위가 가급 자산 외부 제공에 해당하는지 여부(EC-004). TOS §3의 데이터 처리 허용 조항과 충돌 소지.`
  },
  "REG-회계-30조": {
    doc:"회계규정", section:"제30조", title:"지출의 원칙",
    text:``,
    context:"예산 집행 원칙. EC-005의 핵심 내규 조항. OF4 즉시 지급 $4M(약 54억원) 및 5개년 $27M이 연도별 예산 편성 없이 집행됐다면 회계규정 위반.",
    translation:`KT의 모든 지출은 **성립된 예산의 범위 내에서** 집행해야 한다.

예산을 초과하거나 미편성 항목에 지출이 필요한 경우, **재무실과 사전 협의**를 거쳐야 한다.

※ 핵심 쟁점: OF4에 따른 즉시 $4,000,000(400만 달러) 지급 의무가 기존 예산 편성 범위를 초과하는지 여부(EC-005). 사전 예산 협의 없이 집행된 경우 내부 규정 위반이 될 수 있음.`
  },
};

// ─── KNOWLEDGE BASE ───────────────────────────────────────────────────────────

export CONTRACT_KB = {
  clauses: [
    { id:"SAA-1.3.1", doc:"SAA", topic:"독점권 (Target Market)", core:"KT는 한국 내 금융·보험 분야 Palantir Products 독점 재판매권 보유" },
    { id:"SAA-1.3.2", doc:"SAA", topic:"Palantir 직접 판매 금지", core:"KT 동의 없는 Palantir 직접 판매·파트너 선임 금지" },
    { id:"SAA-1.6.8", doc:"SAA", topic:"Other Market 마케팅 제한", core:"Appendix 7 미등재 고객 대상 적극적 마케팅 금지. 위반 시 material breach" },
    { id:"SAA-2.10", doc:"SAA", topic:"Extraordinary Bilateral Transaction", core:"KT 발굴 고객을 Palantir이 직접 계약 시 협의로 처리" },
    { id:"SAA-2.11", doc:"SAA", topic:"Surviving QRC 배분율", core:"KT 10% / Palantir 90% 고정 배분" },
    { id:"SAA-6.2", doc:"SAA", topic:"계약 해지 (material breach)", core:"20일 서면 통보 후 해지. 계약 범위 외 영업은 material breach로 명시" },
    { id:"SAA-6.3", doc:"SAA", topic:"해지 효과 및 잔여 수익 처리", core:"Hurdle 미달성 해지 시 Surviving QRC 수익 good faith 협상" },
    { id:"SAA-7.1", doc:"SAA", topic:"비밀유지", core:"5년 비밀유지. 법원/정부 명령 시 사전 통보 의무" },
    { id:"SAA-8.1", doc:"SAA", topic:"상호 면책", core:"허위진술·서비스 하자·중과실로 인한 제3자 클레임 상호 면책" },
    { id:"SAA-8.2", doc:"SAA", topic:"Liability Cap", core:"max(12개월 Partner Compensation, USD $10M)" },
    { id:"SAA-9.0", doc:"SAA", topic:"준거법·중재지", core:"한국법 적용, 서울 ICC 중재" },
    { id:"SAA-10.4", doc:"SAA", topic:"독립 개발권", core:"KT 기밀 미사용 시 Palantir 경쟁 제품 독립 개발 가능" },
    { id:"OF3-FEES", doc:"OF3", topic:"Enablement Program 지급", core:"$9M, 인보이스 수령 후 30일 내 지급" },
    { id:"OF3-T2", doc:"OF3", topic:"Non-Solicitation (4년)", core:"Palantir Certified KT 직원 4년간 스카우트 금지" },
    { id:"OF4-FEES", doc:"OF4", topic:"Platform License 지급", core:"즉시 $4M, 이후 연 $5~6M, 5년 총 $27M. 편의해지 불가" },
    { id:"OF4-CLOUD", doc:"OF4", topic:"Azure Cloud Infrastructure", core:"PoC Azure 사용. SPC 마이그레이션 시 요금 재협의" },
    { id:"TOS-7", doc:"TOS", topic:"연체이자", core:"연체 시 월 1.5% (연 18%) 이자 부과" },
    { id:"TOS-8.2", doc:"TOS", topic:"해지 (치유 기간)", core:"30일 치유 기간 후 해지" },
    { id:"TOS-8.4", doc:"TOS", topic:"서비스 즉시 정지", core:"KT 위반·보안 리스크 시 사전 통보 없이 즉시 서비스 정지" },
    { id:"TOS-9.1", doc:"TOS", topic:"IP 침해 면책", core:"Palantir Technology 관련 IP 침해 클레임 Palantir이 면책" },
    { id:"TOS-12", doc:"TOS", topic:"Liability Cap (TOS)", core:"max(12개월 Order Form Fee, USD $100K)" },
    { id:"TOS-13", doc:"TOS", topic:"준거법·중재지 (TOS)", core:"영국법 적용, 런던 ICC 중재" },
    { id:"REG-하도급-8조", doc:"하도급지침", topic:"대금 지급기한 (하도급)", core:"수령일로부터 60일 이내. 초과 시 공정위 고시 이율" },
    { id:"REG-하도급-8조⑦", doc:"하도급지침", topic:"계약 해지 최고 기간", core:"중요 내용 위반 시 1개월 이상 최고 후 해지" },
    { id:"REG-정보보호-43조", doc:"정보보호지침", topic:"CISO 보안성 승인", core:"신규 정보시스템 구축 전 CISO 보안성 승인 필수" },
    { id:"REG-정보보호-44조", doc:"정보보호지침", topic:"가급 정보자산 통제", core:"가급 자산 외부 유출 시 부문정보보안관리자 사전승인 필수" },
    { id:"REG-계약-36조", doc:"계약규정", topic:"계약서 필수 기재사항", core:"계약목적·금액·이행기간·지체상금 필수 기재" },
    { id:"REG-계약-18조", doc:"계약규정", topic:"수의계약 집행기준", core:"특정 기술·특허·단일 공급자 해당 시 수의계약 가능" },
    { id:"REG-회계-30조", doc:"회계규정", topic:"예산 집행 원칙", core:"지출은 성립된 예산 범위 내. 초과 시 재무실 사전 협의" },
    { id:"REG-협력사-4조", doc:"협력사선정지침", topic:"협력사 등록 요건", core:"신용등급 B- 이상, TL9000/ISO9001 인증 필요" },
  ],
  conflicts: [
    { id:"XC-001", risk:"HIGH", topic:"치유 기간", summary:"SAA §6.2 (20일) vs TOS §8.2 (30일)" },
    { id:"XC-002", risk:"HIGH", topic:"Liability Cap", summary:"SAA §8.2 ($10M) vs TOS §12 ($100K)" },
    { id:"XC-003", risk:"HIGH", topic:"준거법·중재지", summary:"SAA §9.0 (한국법/서울) vs TOS §13 (영국법/런던)" },
    { id:"XC-004", risk:"HIGH", topic:"서비스 즉시 정지", summary:"TOS §8.4 즉시 정지로 SAA 20일 치유 기간 우회 가능" },
    { id:"XC-005", risk:"HIGH", topic:"해지 후 잔여 Fee", summary:"SAA §6.3 (협상) vs OF4 (ratable 기준)" },
    { id:"IC-001", risk:"HIGH", topic:"독점 vs EBT", summary:"SAA §1.3.2 직접 판매 금지 vs §2.10 EBT 협의" },
    { id:"IC-002", risk:"HIGH", topic:"Surviving QRC 배분", summary:"SAA §6.3 (협상) vs §2.11 (10%/90% 고정)" },
    { id:"EC-001", risk:"HIGH", topic:"연체이자율 충돌", summary:"TOS §7 월 1.5% vs 하도급법 공정위 고시 이율" },
    { id:"EC-002", risk:"HIGH", topic:"해지 최고 기간", summary:"하도급지침 1개월 vs SAA 20일/TOS 30일" },
    { id:"EC-003", risk:"HIGH", topic:"CISO 보안성 승인", summary:"Azure 도입 전 CISO 승인 의무 vs OF4 즉시 사용" },
    { id:"EC-004", risk:"HIGH", topic:"가급 자산 외부 제공", summary:"정보보호지침 사전승인 vs TOS §3 데이터 처리 허용" },
    { id:"EC-005", risk:"HIGH", topic:"예산 집행 원칙", summary:"회계규정 예산 범위 내 집행 vs OF4 즉시 $4M 지급" },
  ],
  appendix7: ["현대자동차","기아","포스코","한화시스템","현대로템","현대글로비스","CJ제일제당","한국해양진흥공사","서울아산병원","산업통상자원부"],
};


// ─── KB PATCH ENGINE ──────────────────────────────────────────────────────────
// Amendment 파싱 결과(patchset)를 CONTRACT_KB와 CLAUSE_FULLTEXT에 직접 반영

export const DOC_TYPES = {
  SAA:    { label:"SAA",       color:"#60a5fa", desc:"Strategic Alliance Agreement" },
  TOS:    { label:"TOS",       color:"#f59e0b", desc:"Terms of Service" },
  OF:     { label:"Order Form",color:"#a78bfa", desc:"Order Form (3, 4, ...)" },
  REG:    { label:"내규",      color:"#34d399", desc:"KT 내부 규정" },
  AMD:    { label:"Amendment", color:"#fb923c", desc:"계약 변경서" },
  NEW:    { label:"신규",      color:"#e879f9", desc:"신규 계약서" },
  OTHER:  { label:"기타",      color:"#8899aa", desc:"기타 문서" },
};

// 충돌 재검토 AI 프롬프트

export const RISK_COLOR  = { HIGH:"#ff2d20", MEDIUM:"#f59e0b", LOW:"#10b981" };
export const RISK_BG     = { HIGH:"#2a0808", MEDIUM:"#2a1f08", LOW:"#082a14" };
export const DOC_COLOR   = { SAA:"#60a5fa", OF3:"#34d399", OF4:"#a78bfa", TOS:"#f59e0b", "하도급지침":"#fb923c", "정보보호지침":"#0ea5e9", "회계규정":"#e879f9", "계약규정":"#f43f5e", "협력사선정지침":"#84cc16" };
export const URGENCY_COL = { "즉시":"#ff2d20", "단기":"#f59e0b", "장기":"#10b981" };
