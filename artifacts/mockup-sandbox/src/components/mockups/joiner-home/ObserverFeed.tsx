import { useState } from "react";

export function ObserverFeed() {
  const [announceModal, setAnnounceModal] = useState(false);
  const [newAnnounce, setNewAnnounce] = useState("");
  const [posted, setPosted] = useState(false);

  const feed = [
    { id: 1, type: "checkin",  time: "08:23", icon: "✅", color: "#10B981", bg: "#ECFDF5", tag: "早间打卡", title: "奶奶今晨状态良好",     detail: "心情 😊 好 · 睡眠 7.5h · 用药已服", author: null },
    { id: 2, type: "med",      time: "08:30", icon: "💊", color: "#6366F1", bg: "#EEF2FF", tag: "用药记录", title: "降压药已按时服用",     detail: "安立生坦片 5mg",                   author: "小明" },
    { id: 3, type: "diary",    time: "10:15", icon: "📔", color: "#F59E0B", bg: "#FFFBEB", tag: "护理日记", title: "今天带奶奶晒了太阳",   detail: "散步约20分钟，精神比昨天好很多…",   author: "小明" },
    { id: 4, type: "announce", time: "14:02", icon: "📢", color: "#0EA5E9", bg: "#EFF6FF", tag: "家庭公告", title: "下周三复查，提醒大家", detail: "协和医院神经内科 · 记得早点出发",   author: "小明" },
    { id: 5, type: "checkin",  time: "21:05", icon: "🌙", color: "#8B5CF6", bg: "#F5F3FF", tag: "晚间打卡", title: "今日护理完成 ⭐ 92分", detail: "心情 😴 平静 · 晚饭胃口好 · 已休息", author: null },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F5] font-['Inter'] relative">
      <div className="h-12" />

      {/* ── Header ── */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-medium text-slate-400 tracking-wide">3月21日 · 周六</p>
            <h1 className="text-xl font-bold text-slate-800 mt-0.5">奶奶的今日动态</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow">
            <span className="text-lg">👩</span>
          </div>
        </div>
        <div className="flex gap-2 mt-2.5 flex-wrap">
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">✅ 早晚打卡完成</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">💊 用药 100%</span>
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full">⭐ 今日 92分</span>
        </div>
      </div>

      {/* ── Announcement card — macaron blue ── */}
      <div className="mx-5 mb-3">
        <div className="bg-white rounded-2xl shadow-sm border border-sky-200 overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-sky-600 tracking-widest">📢 家庭公告</p>
              <button
                onClick={() => setAnnounceModal(true)}
                className="text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full active:scale-95 transition-transform"
              >
                ＋ 发布公告
              </button>
            </div>
            <div className="bg-sky-50 rounded-xl px-3 py-2.5 border border-sky-100">
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">📣</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">下周三复查，提醒大家</p>
                  <p className="text-xs text-slate-500 mt-0.5">协和医院神经内科 · 记得早点出发</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-4 h-4 rounded-full bg-sky-200 flex items-center justify-center" style={{ fontSize: 10 }}>👨</div>
                    <span className="text-xs text-sky-500 font-medium">小明 · 今天 14:02</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full px-4 py-2 text-xs text-sky-500 font-semibold border-t border-sky-100 text-center bg-sky-50/60">
            查看全部公告 →
          </button>
        </div>
      </div>

      {/* ── Elder status card ── */}
      <div className="mx-5 mb-3 rounded-2xl overflow-hidden shadow-sm border border-orange-100">
        <div className="bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 px-5 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow ring-2 ring-orange-100 flex-shrink-0">🐂</div>
            <div className="flex-1 min-w-0">
              <p className="text-orange-400 text-xs font-semibold tracking-wide mb-0.5">被照顾者</p>
              <p className="text-slate-800 font-black text-lg leading-tight">王奶奶</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <p className="text-slate-500 text-xs font-medium">今天状态不错 😊</p>
              </div>
            </div>
            <div className="flex-shrink-0 bg-white rounded-xl px-3 py-2 text-center shadow-sm border border-orange-100">
              <p className="text-orange-500 font-black text-2xl leading-none">92</p>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">护理分</p>
            </div>
          </div>
        </div>
        <div className="bg-white px-4 pt-3 pb-3 flex justify-around divide-x divide-slate-100">
          {[
            { emoji: "😊", label: "心情", val: "好",   color: "#F59E0B" },
            { emoji: "💤", label: "睡眠", val: "7.5h", color: "#6366F1" },
            { emoji: "🍚", label: "饮食", val: "良好", color: "#10B981" },
          ].map(m => (
            <div key={m.label} className="flex-1 text-center px-2">
              <p className="text-lg leading-none mb-1">{m.emoji}</p>
              <p className="text-slate-400 text-xs mb-0.5">{m.label}</p>
              <p className="text-sm font-bold" style={{ color: m.color }}>{m.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline feed ── */}
      <div className="px-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">今日活动记录</p>
        <div className="space-y-3">
          {feed.map((item, i) => (
            <div key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: item.bg, border: `2px solid ${item.color}25` }}>
                  <span>{item.icon}</span>
                </div>
                {i < feed.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 mb-1" style={{ minHeight: 12 }} />}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: item.bg, color: item.color }}>{item.tag}</span>
                  {item.author && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-200 inline-flex items-center justify-center" style={{ fontSize: 9 }}>👤</span>
                      {item.author}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Inline upgrade banner ── */}
      <div className="mx-5 mt-5 mb-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">🔒 更多功能</p>
          <div className="flex justify-around mb-3">
            {[{ e: "✨", l: "打卡" }, { e: "💊", l: "用药" }, { e: "📔", l: "日记" }].map(t => (
              <div key={t.l} className="flex flex-col items-center gap-1 opacity-40">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <span className="text-2xl grayscale">{t.e}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{t.l}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed text-center">
            打卡、用药、日记是主要照顾者的专属功能。<br/>
            如果你也想记录，可以创建自己的家庭档案。
          </p>
        </div>
        <div className="px-4 pb-4 mt-3">
          <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 rounded-xl text-sm shadow-sm active:scale-98 transition-transform">
            ＋ 创建我的家庭档案
          </button>
        </div>
      </div>

      <div className="h-28" />

      {/* ── Bottom nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-2 py-3 flex justify-around">
        {[
          { e: "🏠", l: "首页", active: true,  locked: false },
          { e: "✨", l: "打卡", active: false, locked: true  },
          { e: "💊", l: "用药", active: false, locked: true  },
          { e: "📔", l: "日记", active: false, locked: true  },
          { e: "👨‍👩‍👧", l: "家庭", active: false, locked: false },
        ].map(t => (
          <div key={t.l} className="flex flex-col items-center gap-0.5 relative">
            <span className={`text-xl ${t.locked ? "grayscale opacity-35" : ""}`}>{t.e}</span>
            <span className={`text-xs font-medium ${t.active ? "text-rose-500" : t.locked ? "text-slate-300" : "text-slate-400"}`}>{t.l}</span>
            {t.locked && (
              <span className="absolute -top-0.5 -right-1 w-3.5 h-3.5 bg-slate-300 rounded-full flex items-center justify-center text-white" style={{ fontSize: 8 }}>🔒</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Post announcement modal ── */}
      {announceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
          onClick={() => { setAnnounceModal(false); setPosted(false); setNewAnnounce(""); }}>
          <div className="bg-white rounded-t-3xl px-6 pt-6 pb-8 w-full max-w-sm"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            {posted ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-lg font-black text-slate-800">公告已发布！</p>
                <p className="text-sm text-slate-500 mt-1">家庭成员都会看到你的公告</p>
                <button
                  onClick={() => { setAnnounceModal(false); setPosted(false); setNewAnnounce(""); }}
                  className="mt-4 bg-sky-500 text-white font-bold py-3 px-8 rounded-2xl text-sm">好的</button>
              </div>
            ) : (
              <>
                <p className="text-lg font-black text-slate-800 mb-0.5">发布家庭公告</p>
                <p className="text-xs text-slate-400 mb-3">所有家庭成员都能看到</p>
                <textarea
                  value={newAnnounce}
                  onChange={e => setNewAnnounce(e.target.value)}
                  placeholder="输入公告内容，如：下周三要去复查，有空的家人一起来…"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none outline-none focus:border-sky-300"
                  rows={4}
                />
                <div className="flex gap-2 mt-3 flex-wrap">
                  {["📢 通知", "🏥 就医", "💊 用药", "🌿 日常"].map(tag => (
                    <button key={tag} className="text-xs bg-sky-50 text-sky-600 border border-sky-200 px-2.5 py-1 rounded-full">{tag}</button>
                  ))}
                </div>
                <button
                  onClick={() => newAnnounce.trim() && setPosted(true)}
                  className={`w-full mt-4 font-bold py-3 rounded-2xl text-sm transition-all ${newAnnounce.trim() ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  发布公告
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
