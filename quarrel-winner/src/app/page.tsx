'use client';

import { useState, useEffect } from 'react';
import IntensitySlider from '@/components/IntensitySlider';

interface Reply {
  id: string;
  content: string;
  timestamp: number;
}

interface HistoryItem {
  input: string;
  intensity: number;
  replies: Reply[];
  timestamp: number;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('quarrel-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存历史记录
  const saveToHistory = (newItem: HistoryItem) => {
    const updatedHistory = [newItem, ...history].slice(0, 10); // 只保留最近10条
    setHistory(updatedHistory);
    localStorage.setItem('quarrel-history', JSON.stringify(updatedHistory));
  };

  // 生成回复
  const generateReplies = async () => {
    if (!input.trim()) {
      alert('请输入对方的话');
      return;
    }

    setIsLoading(true);
    setReplies([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          intensity,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const data = await response.json();
      const newReplies = data.replies.map((content: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        content,
        timestamp: Date.now(),
      }));

      setReplies(newReplies);

      // 保存到历史记录
      const historyItem: HistoryItem = {
        input: input.trim(),
        intensity,
        replies: newReplies,
        timestamp: Date.now(),
      };
      saveToHistory(historyItem);

    } catch (error) {
      console.error('Error:', error);
      alert('生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败');
    }
  };

  // 加载历史记录
  const loadHistoryItem = (item: HistoryItem) => {
    setInput(item.input);
    setIntensity(item.intensity);
    setReplies(item.replies);
    setShowHistory(false);
  };

  const getIntensityLabel = (value: number) => {
    const labels = ['温和', '轻微', '一般', '较强', '强烈', '很强', '激烈', '暴躁', '愤怒', '核弹级'];
    return labels[value - 1] || '一般';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">🥊 吵架包赢</h1>
          <p className="text-green-600 text-sm">AI智能反击助手，让你在争论中占据上风</p>
        </div>

        {/* 主要内容区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* 输入区域 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              对方说了什么？
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入对方的话..."
              className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none resize-none transition-colors"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {input.length}/500
            </div>
          </div>

          {/* 强度滑块 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              语气强烈程度：<span className="text-green-600 font-bold">{getIntensityLabel(intensity)}</span>
            </label>
            <IntensitySlider value={intensity} onChange={setIntensity} />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={generateReplies}
              disabled={isLoading || !input.trim()}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              {isLoading ? '生成中...' : '🚀 开始吵架'}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              📝
            </button>
          </div>

          {/* 历史记录 */}
          {showHistory && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-700 mb-3">历史记录</h3>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无历史记录</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => loadHistoryItem(item)}
                      className="p-3 bg-white rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
                    >
                      <p className="text-sm text-gray-700 truncate">{item.input}</p>
                      <p className="text-xs text-gray-500">
                        强度: {getIntensityLabel(item.intensity)} • {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 回复结果 */}
        {replies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-green-700 text-center mb-4">
              💪 AI为你生成的反击回复
            </h2>
            {replies.map((reply, index) => (
              <div
                key={reply.id}
                className="bg-white rounded-2xl shadow-lg p-5 animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                    回复 {index + 1}
                  </span>
                  <button
                    onClick={() => copyToClipboard(reply.content)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    📋 复制
                  </button>
                </div>
                <p className="text-gray-800 leading-relaxed">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="text-green-600 mt-2">AI正在为你生成犀利回复...</p>
          </div>
        )}

        {/* 底部说明 */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>⚡ 由 DeepSeek V3 AI 驱动</p>
          <p className="mt-1">请理性使用，和谐交流 💚</p>
        </div>
      </div>
    </div>
  );
}