export function TodaysStory() {
  return (
    <div className="min-h-screen bg-[#FBF7F0] font-['Noto_Serif_SC'] overflow-x-hidden">
      <div className="h-12" />

      {/* Header */}
      <div className="px-6 pt-3 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#B07848] font-medium tracking-widest uppercase">丙牛年 · 二月初四</p>
          <h1 className="text-xl font-bold text-[#3D2B1F] mt-0.5">今日故事</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-[#B07848]">小红 · 家庭成员</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow">
            <span className="text-base">👩</span>
          </div>
        </div>
      </div>

      {/* Main story card */}
      <div className="mx-5 mt-3 rounded-3xl overflow-hidden shadow-md">
        {/* Decorative top gradient */}
        <div className="h-2 bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-300" />
        <div className="bg-white px-5 pt-5 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌅</span>
            <div>
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide">今日故事</p>
              <p className="text-xs text-slate-400">3月21日 · 由小明记录</p>
            </div>
          </div>
          <p className="text-[#3D2B1F] text-base leading-8 font-normal">
            今天是个好天气，奶奶早上起来就精神不错。小明帮她量了血压，<span className="text-rose-500 font-semibold">130/85，比上周好多了</span>。饭后两人在楼下花园散步了近20分钟，奶奶说"腿脚感觉轻松了"。
          </p>
          <p className="text-[#3D2B1F] text-base leading-8 mt-3">
            午后阳光正好，奶奶趴在阳台看了会儿鸽子，心情很好。用药也按时完成，<span className="text-emerald-600 font-semibold">今日护理得分92分</span> ⭐
          </p>
        </div>
      </div>

      {/* 3 quick moment cards */}
      <div className="px-5 mt-4">
        <p className="text-xs font-semibold text-[#B07848] uppercase tracking-widest mb-3">今日三刻</p>
        <div className="space-y-3">
          {[
            { time: "08:23", emoji: "☀️", moment: "清晨打卡", detail: "奶奶睡了7.5小时，心情😊愉快", color: "#FEF3C7", border: "#FCD34D" },
            { time: "10:15", emoji: "🌿", moment: "散步时光", detail: "花园走了一圈，说腿脚轻松", color: "#ECFDF5", border: "#6EE7B7" },
            { time: "21:05", emoji: "🌙", moment: "晚间安歇", detail: "按时休息，已服晚间用药", color: "#EDE9FE", border: "#C4B5FD" },
          ].map(m => (
            <div key={m.time} className="flex items-center gap-3 rounded-2xl p-3.5 border" style={{ backgroundColor: m.color, borderColor: m.border }}>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                {m.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#3D2B1F]">{m.moment}</p>
                  <span className="text-xs text-slate-400">{m.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message from caregiver */}
      <div className="mx-5 mt-4 bg-rose-50 rounded-2xl p-4 border border-rose-100">
        <div className="flex items-start gap-2">
          <span className="text-lg">💬</span>
          <div>
            <p className="text-xs font-semibold text-rose-400 mb-1">小明留言给家人</p>
            <p className="text-sm text-slate-700 leading-relaxed italic">"今天奶奶精神不错，大家放心。下周三要去复查，有时间的话一起去吧。"</p>
          </div>
        </div>
      </div>

      <div className="h-24" />
      <div className="fixed bottom-0 left-0 right-0 bg-[#FBF7F0]/95 backdrop-blur border-t border-amber-100 px-6 py-3 flex justify-around">
        {[{ e: "🏠", l: "首页", a: true }, { e: "✨", l: "打卡" }, { e: "💊", l: "用药" }, { e: "📔", l: "日记" }, { e: "👨‍👩‍👧", l: "家庭" }].map(t => (
          <div key={t.l} className={`flex flex-col items-center gap-0.5 ${t.a ? 'opacity-100' : 'opacity-35'}`}>
            <span className="text-xl">{t.e}</span>
            <span className={`text-xs font-medium ${t.a ? 'text-[#B07848]' : 'text-slate-400'}`}>{t.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
