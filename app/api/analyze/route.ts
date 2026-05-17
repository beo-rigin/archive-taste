import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const POSTER_PROMPT = `이 이미지를 분석하여 다음 카테고리별로 한국어 태그를 제공해주세요.
규칙: 각 값은 반드시 단어 또는 짧은 명사형으로만 작성하세요. "~하고", "~이고", "~한" 등의 연결어 없이 독립된 단어만 씁니다.
반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "사조": "예술 사조나 스타일 한 단어 (예: 모더니즘, 팝아트, 미니멀리즘, 빈티지, 현대 일러스트레이션)",
  "형태및드로잉": "형태 스타일 한 단어 (예: 평면적, 입체적, 추상적, 사실적, 콜라주)",
  "색감질감": "색감이나 질감 한 단어 (예: 모노크롬, 파스텔톤, 과슈 질감, 고채도)",
  "무드감성": "무드나 감성 한 단어 (예: 몽환적, 위트있는, 서정적, 평화로움, 상쾌한)",
  "작가명": "유사한 작가나 스타일 출처 (알 수 없으면 '미상')"
}`;

const FOOD_PROMPT = `이 음식 이미지를 분석해주세요.
규칙: 각 값은 반드시 단어 또는 짧은 명사형으로만 작성하세요.
반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "대분류": "음식의 국적/계열 (예: 양식, 중식, 전통한식, 퓨전한식, 일식, 동남아식, 멕시칸, 인도식)",
  "중분류": "구체적인 메뉴 분류 (예: 파스타, 라멘, 비빔밥, 포케, 국밥, 피자, 스테이크, 초밥, 딤섬)"
}`;

export async function POST(request: NextRequest) {
  try {
    // Anthropic API 키가 없으면 빈 태그 반환 (AI 분석 생략)
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder') {
      return NextResponse.json({ tags: {} });
    }

    const { imageUrl, mode = 'poster' } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const prompt = mode === 'food' ? FOOD_PROMPT : POSTER_PROMPT;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: imageUrl },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No JSON in response' }, { status: 500 });
    }

    const tags = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
