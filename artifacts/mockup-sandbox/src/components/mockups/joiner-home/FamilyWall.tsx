export function FamilyWall() {
  const members = [
    { name: "小明", role: "主要照顾者", emoji: "👨", color: "#6C9E6C", online: true },
    { name: "小红", role: "家庭成员", emoji: "👩", color: "#A855F7", online: true, isMe: true },
    { name: "大牛", role: "家庭成员", emoji: "👦", color: "#3B82F6", online: false },
  ];

  const posts = [
    {
      id: 1,
      author: "小明", emoji: "👨", color: "#6C9E6C",
      time: "今天 14:02", tag: "📢 通知", tagColor: "#FEF3C7", tagText: "#92400E",
      content: "下周三上午9点，协和医院神经内科复查，有时间的家人可以一起陪。",
      likes: 2,
    },
    {
      id: 2,
      author: "小明", emoji: "👨", color: "#6C9E6C",
      time: "今天 10:15", tag: "🌿 日常", tagColor: "#ECFDF5", tagText: "#065F46",
      content: "今天带奶奶在楼下花园散步20分钟，她说「腿感觉轻多了」，血压也比上周好了。☀️",
      likes: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50/40 font-['Inter']">
      <div className="h-12" />

      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-slate-800">家庭墙</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">王奶奶的家庭空间 · ABC123</p>
          </div>
          <div className="text-sm font-semibold text-violet-600 bg-violet-100 px-3 py-1.5 rounded-full">
            🔗 邀请
          </div>
        </div>
      </div>

      {/* Family members strip */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-purple-100/60">
          <div className="flex gap-3 overflow-x-auto">
            {members.map(m => (
              <div key={m.name} className={`flex flex-col items-center gap-1 flex-shrink-0 ${m.isMe ? 'opacity-100' : ''}`}>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: m.color + '20', border: `2px solid ${m.color}${m.isMe ? 'FF' : '60'}` }}>
                    <span>{m.emoji}</span>
                  </div>
                  {m.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
                  {m.isMe && <span className="absolute -top-1 -right-1 text-xs bg-violet-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">我</span>}
                </div>
                <p className="text-xs font-semibold text-slate-700">{m.name}</p>
                <p className="text-xs text-slate-400" style={{ fontSize: 10 }}>{m.role}</p>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                <span className="text-slate-400 text-lg font-light">＋</span>
              </div>
              <p className="text-xs text-slate-400">邀请</p>
            </div>
          </div>
        </div>
      </div>

      {/* Elder status badge */}
      <div className="mx-5 mb-4 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center text-3xl shadow">🐂</div>
          <div className="flex-1">
            <p className="text-white/80 text-xs font-medium">今日状态</p>
            <p className="text-white font-bold text-base">奶奶 · 状态优秀 🌟</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">😊 心情好</span>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">💊 用药✓</span>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">⭐ 92分</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="px-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">家庭动态</p>
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: post.color + '20' }}>
                  {post.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{post.author}</p>
                  <p className="text-xs text-slate-400">{post.time}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: post.tagColor, color: post.tagText }}>{post.tag}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-50">
                <button className="text-xs text-slate-400 flex items-center gap-1">❤️ {post.likes}</button>
                <button className="text-xs text-slate-400">💬 回复</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-24" />
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-purple-100 px-6 py-3 flex justify-around">
        {[{ e: "🏠", l: "首页", a: true }, { e: "✨", l: "打卡" }, { e: "💊", l: "用药" }, { e: "📔", l: "日记" }, { e: "👨‍👩‍👧", l: "家庭" }].map(t => (
          <div key={t.l} className={`flex flex-col items-center gap-0.5 ${t.a ? 'opacity-100' : 'opacity-35'}`}>
            <span className="text-xl">{t.e}</span>
            <span className={`text-xs font-medium ${t.a ? 'text-violet-600' : 'text-slate-400'}`}>{t.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
