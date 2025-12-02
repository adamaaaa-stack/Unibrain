"use client";

interface StudyTipsProps {
  tips: string[];
}

export default function StudyTips({ tips }: StudyTipsProps) {
  if (!tips || tips.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No study tips available
      </div>
    );
  }

  const tipIcons = [
    "💡", "📚", "🎯", "⏰", "🧠", "✨", "📝", "🔄", "💪", "🎓"
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Personalized Study Tips
        </h3>
        <p className="text-slate-400 text-sm">
          Recommendations based on this course material
        </p>
      </div>

      <div className="grid gap-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="group p-5 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-2xl">{tipIcons[index % tipIcons.length]}</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Tip #{index + 1}</h4>
                <p className="text-slate-300 leading-relaxed">{tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational footer */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 text-center">
        <p className="text-lg text-white mb-2">Ready to master this material?</p>
        <p className="text-slate-400 text-sm">
          Use flashcards for memorization, take the quiz to test yourself, and practice with open-ended questions for deeper understanding.
        </p>
      </div>
    </div>
  );
}

