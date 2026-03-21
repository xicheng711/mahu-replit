export function StatusDashboard() {
  const metrics = [
    { label: "心情", value: "愉快", emoji: "😊", color: "#F59E0B", bg: "#FFFBEB", score: 85 },
    { label: "睡眠", value: "7.5h", emoji: "💤", color: "#6366F1", bg: "#EEF2FF", score: 75 },
    { label: "用药", value: "100%", emoji: "💊", color: "#10B981", bg: "#ECFDF5", score: 100 },
    { label: "饮食", value: "良好", emoji: "🍚", color: "#EC4899", bg: "#FDF2F8", score: 80 },
  ];

  const week = ["一", "二", "三", "四", "五", "六", "日"];
  const scores = [78, 85, 62, 91, 88, 92, null];

  return (
    <div className="min-h-screen bg-[#0F172A] font-['Inter'] text-white">
      <div className="h-12" />

      {/* Header */}
      <div className="px-5 pt-2 pb-4 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium">3月21日 · 周六</p>
          <h1 className="text-lg font-bold text-white mt-0.5">王奶奶健康总览</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
          <span className="text-base">👩</span>
        </div>
      </div>

      {/* Score ring + status */}
      <div className="mx-5 mb-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-4">
          {/* Ring */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1E293B" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad)" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40 * 0.92} ${2 * Math.PI * 40}`}
                strokeLinecap="round" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white leading-none">92</span>
              <span className="text-xs text-slate-400">护理分</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-semibold">今日状态优秀</span>
            </div>
            <p className="text-white font-semibold text-sm leading-snug">奶奶今天早晚都打卡了，所有用药按时服用</p>
            <p className="text-slate-400 text-xs mt-1">主要照顾者：小明 · 08:23 更新</p>
          </div>
        </div>
      </div>

      {/* 4 metric cards */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-medium">{m.label}</span>
              <span className="text-base">{m.emoji}</span>
            </div>
            <p className="text-white text-xl font-bold">{m.value}</p>
            {/* Mini bar */}
            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: m.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly trend */}
      <div className="mx-5 bg-slate-800/80 rounded-2xl p-4 mb-4 border border-slate-700/40">
        <p className="text-xs font-semibold text-slate-400 mb-3">本周护理得分趋势</p>
        <div className="flex items-end justify-between gap-1 h-16">
          {scores.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm" style={{ height: s ? `${(s / 100) * 64}px` : 0, background: s === 92 ? 'linear-gradient(to top, #A78BFA, #EC4899)' : '#334155' }} />
              <span className="text-xs text-slate-500">{week[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent events */}
      <div className="px-5">
        <p className="text-xs font-semibold text-slate-400 mb-2">今日记录</p>
        {[
          { time: "08:23", icon: "✅", text: "早间打卡完成 · 92分" },
          { time: "10:15", icon: "📔", text: "小明写了护理日记" },
          { time: "21:05", icon: "🌙", text: "晚间打卡完成" },
        ].map(e => (
          <div key={e.time} className="flex items-center gap-3 py-2 border-b border-slate-800">
            <span className="text-base">{e.icon}</span>
            <span className="text-sm text-slate-300 flex-1">{e.text}</span>
            <span className="text-xs text-slate-500">{e.time}</span>
          </div>
        ))}
      </div>

      <div className="h-24" />
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-6 py-3 flex justify-around">
        {[{ e: "🏠", l: "首页", a: true }, { e: "✨", l: "打卡" }, { e: "💊", l: "用药" }, { e: "📔", l: "日记" }, { e: "👨‍👩‍👧", l: "家庭" }].map(t => (
          <div key={t.l} className={`flex flex-col items-center gap-0.5 ${t.a ? 'opacity-100' : 'opacity-30'}`}>
            <span className="text-xl">{t.e}</span>
            <span className={`text-xs font-medium ${t.a ? 'text-violet-400' : 'text-slate-500'}`}>{t.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
