import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { opponentText, intensity } = await request.json()

    if (!opponentText || typeof intensity !== 'number') {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400 }
      )
    }

    // 根据强度调整 prompt
    const intensityPrompts = {
      1: "请用温和、理性的方式",
      2: "请用稍微强硬但礼貌的方式", 
      3: "请用坚定有力的方式",
      4: "请用略带讽刺的方式",
      5: "请用犀利但不失风度的方式",
      6: "请用强烈反击的方式",
      7: "请用激烈对抗的方式",
      8: "请用毫不留情的方式",
      9: "请用极其犀利的方式",
      10: "请用最强烈、最有杀伤力的方式"
    }

    const intensityPrompt = intensityPrompts[intensity as keyof typeof intensityPrompts] || intensityPrompts[5]

    const systemPrompt = `你是一个专业的辩论和反驳专家。用户会给你一段对方说的话，你需要${intensityPrompt}生成3个不同角度的反击回复。

要求：
1. 回复要有逻辑性和说服力
2. 根据强度等级调整语言的激烈程度
3. 每个回复都要从不同角度反击
4. 语言要地道、自然，符合中文表达习惯
5. 避免人身攻击，重点攻击观点和逻辑
6. 回复长度控制在50-100字之间
7. 要有一定的幽默感和智慧

请直接返回3个回复，每个回复用换行分隔，不要添加序号或其他格式。`

    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `对方说："${opponentText}"\n\n请生成3个反击回复（强度等级：${intensity}/10）`
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
      extra_headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "吵架包赢",
      },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI 返回内容为空')
    }

    // 解析回复，按换行分割
    const replies = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+[.\s]*/, '').trim()) // 移除可能的序号
      .filter(line => line.length > 10) // 过滤太短的回复
      .slice(0, 3) // 只取前3个

    if (replies.length === 0) {
      throw new Error('未能生成有效回复')
    }

    // 如果不足3个回复，补充一些通用回复
    while (replies.length < 3) {
      const fallbackReplies = [
        "你这话说得倒是挺有意思的，不过逻辑上还是有些问题的。",
        "我觉得你可能需要重新思考一下这个问题。",
        "这种观点确实很独特，但可能不太符合实际情况。"
      ]
      replies.push(fallbackReplies[replies.length - 1] || fallbackReplies[0])
    }

    return NextResponse.json({ replies })

  } catch (error) {
    console.error('生成回复失败:', error)
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    )
  }
}

// 导出一个空的 generateReplies 函数供客户端使用
export const generateReplies = async () => {}