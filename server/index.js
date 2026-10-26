import express from 'express';
import { triage } from '../src/lib/triage/triage.js';
import { retrieve } from '../src/lib/rag/retrieve.js';

const PORT = process.env.PORT ?? 3001;
const MAX_MESSAGES = 10;
const MAX_LENGTH = 1000;

const app = express();
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

/**
 * POST /api/triage
 * body: { messages: string[] }  사용자가 지금까지 입력한 문장들 (추가 질문에 대한 답변 포함)
 * 대화 전체를 하나의 증상 설명으로 합쳐서 다시 판정한다.
 */
app.post('/api/triage', async (req, res) => {
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: `messages 는 1~${MAX_MESSAGES}개의 문자열 배열이어야 합니다.` });
  }
  if (messages.some((m) => typeof m !== 'string' || !m.trim() || m.length > MAX_LENGTH)) {
    return res.status(400).json({ error: `각 메시지는 1~${MAX_LENGTH}자의 문자열이어야 합니다.` });
  }

  try {
    const result = await triage(messages.join('\n'));
    res.json(result);
  } catch (e) {
    console.error('[triage] 실패:', e.message);
    res.status(502).json({ error: '판정 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
  }
});

app.listen(PORT, async () => {
  console.log(`API 서버: http://localhost:${PORT}`);
  // 첫 요청이 느리지 않도록 임베딩 모델을 미리 올려 둔다
  await retrieve('워밍업', 1).catch((e) => console.error('워밍업 실패:', e.message));
  console.log('임베딩 모델 준비 완료');
});
