import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { input, intensity } = await request.json();

    if (!input || typeof intensity !== 'number') {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400 }
      );
    }

    // 根据强度级别调整提示词
    const getIntensityPrompt = (level: number) => {
      if (level <= 3) return "温和但有力地";
      if (level <= 5) return "坚定地";
      if (level <= 7) return "强烈地";
      if (level <= 9) return "激烈地";
      return "毫不留情地";
    };

    const intensityPrompt = getIntensityPrompt(intensity);

    const systemPrompt = `你是一个专业的辩论助手，擅长生成有力的反驳回复。请根据用户提供的对方言论，${intensityPrompt}进行反击。

要求：
1. 生成3条不同角度的反击回复
2. 回复要有逻辑性和说服力
3. 语气要符合强度等级（1-10级，当前${intensity}级）
4. 避免人身攻击，专注于观点反驳
5. 每条回复控制在50-100字
6. 回复要有中国网络文化特色，可以适当使用网络用语

请直接返回3条回复，用换行符分隔，不要添加序号或其他格式。`;

    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `对方说："${input}"\n\n请生成3条反击回复。`
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
      extra_headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "吵架包赢",
      },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('AI 回复为空');
    }

    // 分割回复内容
    const replies = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+[\.、]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 3); // 确保只返回3条

    if (replies.length === 0) {
      throw new Error('无法生成有效回复');
    }

    return NextResponse.json({ replies });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    );
  }
}