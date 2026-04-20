"use client";

type Props = {
  type: "terms" | "privacy" | "location" | "marketing" | "notice" | "support";
  onClose: () => void;
};

const TERMS = `제1조 (목적)
이 약관은 모응(이하 "서비스")이 제공하는 이벤트 정보 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 모응이 운영하는 웹사이트 및 관련 서비스를 의미합니다.
② "회원"이란 서비스에 가입하여 서비스를 이용하는 자를 말합니다.

제3조 (서비스 이용)
① 서비스는 자동차, 가전, 라이프스타일 등 다양한 분야의 이벤트 정보를 수집·제공합니다.
② 서비스에 게재된 이벤트 정보는 각 브랜드 및 업체가 제공한 정보로, 서비스는 정보의 정확성을 보증하지 않습니다.
③ 이벤트 참여 및 신청은 해당 브랜드의 공식 채널을 통해 이루어지며, 서비스는 이에 대한 책임을 지지 않습니다.

제4조 (회원 가입)
① 회원 가입은 휴대폰 번호 인증을 통해 이루어집니다.
② 회원은 정확한 정보를 제공하여야 하며, 타인의 정보를 도용하여 가입할 수 없습니다.
③ 만 14세 미만은 서비스에 가입할 수 없습니다.

제5조 (서비스 이용 제한)
다음 각 호에 해당하는 경우 서비스 이용을 제한할 수 있습니다.
① 타인의 정보를 도용하거나 허위 정보를 제공한 경우
② 서비스의 정상적인 운영을 방해하는 경우
③ 기타 관계 법령 또는 이 약관을 위반한 경우

제6조 (지식재산권 보호)
① 서비스의 디자인, 텍스트, 로고, UI 구성, 데이터베이스 등 서비스를 구성하는 모든 요소에 대한 저작권 및 지식재산권은 모응에 귀속됩니다.
② 이용자는 서비스의 전부 또는 일부를 무단으로 복제, 배포, 수정, 전시, 전송하거나 이를 이용하여 제3의 서비스를 제작하는 행위를 할 수 없습니다.
③ 서비스에 게시된 이벤트 정보를 크롤링, 스크래핑 등 자동화된 방법으로 수집하거나 상업적으로 이용하는 행위를 금지합니다.
④ 위 조항을 위반할 경우 저작권법 등 관련 법령에 따라 민·형사상 책임을 질 수 있습니다.

제7조 (책임 제한)
① 서비스는 천재지변, 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.
② 서비스에 링크된 외부 사이트에서 발생한 손해에 대해 책임을 지지 않습니다.

제8조 (분쟁 해결)
서비스 이용과 관련하여 발생한 분쟁은 대한민국 법률에 따르며, 관할 법원은 민사소송법상의 관할 법원으로 합니다.

부칙
이 약관은 2026년 4월 19일부터 시행합니다.`;

const PRIVACY = `모응(이하 "서비스")은 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.

1. 수집하는 개인정보 항목
· 필수: 휴대폰 번호, 닉네임
· 자동 수집: 서비스 이용 기록, 접속 로그

2. 개인정보 수집 및 이용 목적
· 회원 가입 및 본인 확인
· 서비스 제공 및 운영
· 고객 문의 응대
· 서비스 개선 및 통계 분석

3. 개인정보 보유 및 이용 기간
· 회원 탈퇴 시까지 보유 후 즉시 파기
· 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관

4. 개인정보의 제3자 제공
서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령에 의한 경우 예외로 합니다.

5. 개인정보 처리 위탁
· Supabase Inc.: 데이터베이스 및 인증 서비스 운영
· Solapi: SMS 인증번호 발송

6. 정보주체의 권리
이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제 및 처리 정지를 요청할 수 있습니다. 회원 탈퇴 시 모든 개인정보가 삭제됩니다.

7. 개인정보 보호책임자
· 담당자: 우호용
· 이메일: support@moeung.kr

8. 시행일
이 개인정보처리방침은 2026년 4월 19일부터 시행합니다.`;

const LOCATION = `제1조 (목적)
이 약관은 모응(이하 "서비스")이 위치기반서비스를 제공함에 있어 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (위치기반서비스의 내용)
서비스는 이용자의 위치 정보를 활용하여 주변 이벤트 및 관련 정보를 제공할 수 있습니다. (현재 미제공, 향후 제공 예정)

제3조 (위치정보의 수집·이용)
① 서비스는 위치기반서비스 제공을 위해 이용자의 위치 정보를 수집할 수 있습니다.
② 수집된 위치 정보는 서비스 제공 목적 외의 용도로 사용하지 않습니다.

제4조 (위치정보의 보유 기간)
위치 정보는 서비스 제공 목적 달성 시 즉시 파기합니다.

제5조 (위치정보의 제3자 제공)
서비스는 이용자의 동의 없이 위치 정보를 제3자에게 제공하지 않습니다.

제6조 (개인위치정보주체의 권리)
이용자는 언제든지 위치 정보 수집·이용·제공에 대한 동의를 철회할 수 있습니다.

부칙
이 약관은 2026년 4월 19일부터 시행합니다.`;

const NOTICE = `[공지] 모응 서비스 오픈 안내

안녕하세요, 모응팀입니다.

모응은 자동차 시승, 가전 체험, 라이프스타일 응모 등 다양한 이벤트 정보를 한곳에서 확인할 수 있는 서비스입니다.

앞으로 더 많은 브랜드와 이벤트를 빠르게 추가해 나갈 예정이며, 이용자분들의 소중한 의견을 반영해 서비스를 발전시키겠습니다.

문의 및 제안은 고객센터(support@moeung.kr)로 남겨주세요.

감사합니다.
모응팀 드림

시행일: 2026년 4월`;

const SUPPORT = `고객센터 안내

· 이메일: support@moeung.kr
· 운영 시간: 평일 10:00 ~ 18:00 (주말·공휴일 휴무)

문의 유형별 안내

[이벤트 정보 오류]
특정 이벤트의 정보가 잘못되었거나 마감된 이벤트가 표시되는 경우 이메일로 제보해 주세요. 신속하게 수정하겠습니다.

[이벤트 등록 제안]
등록을 원하시는 이벤트가 있으시면 이벤트 이름과 링크를 함께 보내주세요.

[서비스 오류 신고]
서비스 이용 중 오류가 발생한 경우 오류 내용과 이용 환경(기기, 브라우저 등)을 함께 보내주시면 빠르게 처리하겠습니다.

[기타 문의]
서비스 관련 기타 문의 사항은 이메일로 연락 주시면 순차적으로 답변드리겠습니다.

감사합니다.
모응팀 드림`;

const MARKETING = `수신 동의 항목
· 이메일, SMS, 앱 푸시 알림을 통한 이벤트 및 혜택 정보

수집·이용 목적
· 신규 이벤트, 마감 임박 이벤트 알림
· 개인 맞춤형 이벤트 추천
· 서비스 관련 특가 및 혜택 안내

보유 및 이용 기간
· 마케팅 수신 동의 철회 시까지

동의 거부 권리
마케팅 정보 수신 동의는 선택 사항입니다. 동의하지 않아도 서비스 이용에 제한이 없습니다. 동의 이후에도 마이페이지 > 설정에서 언제든지 철회할 수 있습니다.

시행일: 2026년 4월 19일`;

export default function LegalModal({ type, onClose }: Props) {
  const titles = { terms: "이용약관", privacy: "개인정보처리방침", location: "위치기반서비스 이용약관", marketing: "마케팅 정보 수신 동의", notice: "공지사항", support: "고객센터" };
  const contents = { terms: TERMS, privacy: PRIVACY, location: LOCATION, marketing: MARKETING, notice: NOTICE, support: SUPPORT };
  const title = titles[type];
  const content = contents[type];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-extrabold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <pre className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">{content}</pre>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
