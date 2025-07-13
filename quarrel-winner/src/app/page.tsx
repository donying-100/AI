'use client'

import { useState } from 'react'
import { generateReplies } from './api/generate/route'

interface Reply {
  id: number
  content: string
  timestamp: number
}

export default function Home() {
  const [opponentText, setOpponentText] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [replies, setReplies] = useState<Reply[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<Array<{
    opponentText: string
    intensity: number
    replies: Reply[]
    timestamp: number
  }>>([])

  // 从 localStorage 加载历史记录
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('quarrel-history')
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  })

  const handleGenerate = async () => {
    if (!opponentText.trim()) {
      alert('请输入对方的话！')
      return
    }

    setIsLoading(true)
    setReplies([])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opponentText: opponentText.trim(),
          intensity,
        }),
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const data = await response.json()
      const newReplies = data.replies.map((content: string, index: number) => ({
        id: Date.now() + index,
        content,
        timestamp: Date.now(),
      }))

      setReplies(newReplies)

      // 保存到历史记录
      const newHistoryItem = {
        opponentText,
        intensity,
        replies: newReplies,
        timestamp: Date.now(),
      }
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10) // 只保留最近10条
      setHistory(updatedHistory)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('quarrel-history', JSON.stringify(updatedHistory))
      }
    } catch (error) {
      console.error('生成回复失败:', error)
      alert('生成失败，请重试！')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板！')
    })
  }

  const getIntensityLabel = (value: number) => {
    if (value <= 2) return '温和'
    if (value <= 4) return '普通'
    if (value <= 6) return '强烈'
    if (value <= 8) return '激烈'
    return '核弹级'
  }

  const getIntensityColor = (value: number) => {
    if (value <= 2) return 'text-green-600'
    if (value <= 4) return 'text-blue-600'
    if (value <= 6) return 'text-yellow-600'
    if (value <= 8) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🔥 吵架包赢</h1>
          <p className="text-sm text-gray-600">AI智能吵架助手，让你在争论中占据上风</p>
        </div>

        {/* 主要输入区域 */}
        <div className="wechat-card p-4 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              对方说了什么？
            </label>
            <textarea
              value={opponentText}
              onChange={(e) => setOpponentText(e.target.value)}
              placeholder="输入对方的话..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {opponentText.length}/500
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语气强烈程度: <span className={`font-bold ${getIntensityColor(intensity)}`}>
                {intensity} - {getIntensityLabel(intensity)}
              </span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 slider-track rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #07c160 0%, #ff6b6b 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>温和</span>
                <span>核弹级</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !opponentText.trim()}
            className="w-full wechat-button disabled:opacity-50"
          >
            {isLoading ? (
              <span className="loading-dots">生成中</span>
            ) : (
              '🚀 开始吵架'
            )}
          </button>
        </div>

        {/* 回复结果 */}
        {replies.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">💪 反击回复</h3>
            {replies.map((reply, index) => (
              <div key={reply.id} className="reply-card">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm opacity-80">回复 {index + 1}</span>
                  <button
                    onClick={() => copyToClipboard(reply.content)}
                    className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30 transition-colors"
                  >
                    复制
                  </button>
                </div>
                <p className="text-white leading-relaxed">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="wechat-card p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📚 历史记录</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.slice(0, 5).map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="text-sm text-gray-600 mb-1">
                    对方: "{item.opponentText.slice(0, 30)}{item.opponentText.length > 30 ? '...' : ''}"
                  </div>
                  <div className="text-xs text-gray-500">
                    强度: {item.intensity} | {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            {history.length > 5 && (
              <div className="text-center mt-2">
                <span className="text-xs text-gray-500">还有 {history.length - 5} 条历史记录</span>
              </div>
            )}
          </div>
        )}

        {/* 页脚 */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>⚠️ 请理性使用，和谐交流</p>
          <p className="mt-1">Powered by AI • 仅供娱乐</p>
        </div>
      </div>
    </div>
  )
}