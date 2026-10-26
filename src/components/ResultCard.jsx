const LEVEL_LABEL = { 1: '소생', 2: '긴급', 3: '응급', 4: '준응급', 5: '비응급' };

/**
 * 판정 결과 카드: 등급, 119 안내, 근거, 추가 질문
 * @param {{result: object, onAnswer: (question: string) => void, answerable: boolean}} props
 */
export default function ResultCard({ result, onAnswer, answerable }) {
  const level = result.finalLevel;
  const lowConfidence = result.confidence < 0.7;

  return (
    <div className="result">
      {result.call119 && (
        <div className="alert119" role="alert">
          <strong>지금 119에 신고하세요.</strong>
          <span>응급 가능성이 높습니다. 이 결과를 기다리지 말고 연락하세요.</span>
          <a href="tel:119">119 전화하기</a>
        </div>
      )}

      <div className="result-head">
        <span className={`level level-${level}`}>
          KTAS {level} · {LEVEL_LABEL[level]}
        </span>
        <span className="symptom">
          {result.symptom.population} · {result.symptom.name}
        </span>
      </div>

      {result.raisedBySafety && (
        <p className="note warn">
          안전 규칙으로 등급을 올렸습니다 ({result.safetyReasons.join(', ')}). AI 판단은 {result.llmLevel}단계였습니다.
        </p>
      )}

      <p className="reason">{result.level_reason}</p>

      <div className="meter" aria-label={`신뢰도 ${Math.round(result.confidence * 100)}%`}>
        <div className="meter-bar" style={{ width: `${Math.round(result.confidence * 100)}%` }} />
        <span>
          신뢰도 {Math.round(result.confidence * 100)}%{lowConfidence && ' · 정보가 부족해 확정하기 어렵습니다'}
        </span>
      </div>

      <dl className="facts">
        <dt>추천 진료과</dt>
        <dd>{result.suggested_department}</dd>
        {result.matched_criteria.length > 0 && (
          <>
            <dt>적용한 KTAS 기준</dt>
            <dd>
              <ul>
                {result.matched_criteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>

      {result.missing_info_questions.length > 0 && answerable && (
        <div className="followups">
          <p className="followups-title">더 정확한 판정을 위해 알려 주세요</p>
          <div className="chips">
            {result.missing_info_questions.map((q) => (
              <button key={q} type="button" className="chip" onClick={() => onAnswer(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <details className="candidates">
        <summary>비슷한 후보 증상 보기</summary>
        <ol>
          {result.candidates.slice(0, 5).map((c) => (
            <li key={c.id} className={c.id === result.symptom.id ? 'picked' : ''}>
              {c.population} · {c.name}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
