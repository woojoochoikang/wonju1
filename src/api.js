/**
 * 서버에 증상 판정을 요청한다.
 * @param {string[]} messages 지금까지 사용자가 입력한 문장들
 * @returns {Promise<object>} triage 결과 (서버의 triage() 반환값)
 */
export async function requestTriage(messages) {
  const res = await fetch('/api/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `요청 실패 (${res.status})`);
  return data;
}
