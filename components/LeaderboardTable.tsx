import React from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  faction: string;
  points: number;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
}

// 排名图标
const getRankDisplay = (rank: number) => {
  if (rank === 1) return <span className="text-xl animate-pulse">🏆</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-gold-400/80 font-bold">{rank}</span>;
};

// 排名背景样式
const getRankRowClass = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-900/40 via-amber-800/30 to-yellow-900/40 border-amber-500/50';
  if (rank === 2) return 'bg-gradient-to-r from-slate-700/40 via-slate-600/30 to-slate-700/40 border-slate-400/50';
  if (rank === 3) return 'bg-gradient-to-r from-amber-900/30 via-orange-800/20 to-amber-900/30 border-orange-500/40';
  return 'border-ink-600/30 hover:bg-ink-800/40';
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data }) => {
  return (
    <div className="w-full h-full relative">
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-8xl text-gold-400">☯</div>
        <div className="absolute bottom-1/4 right-1/4 text-6xl text-gold-400">⚔</div>
      </div>

      <table className="w-full text-sm text-left text-paper-300 table-fixed relative z-10">
        <thead className="text-xs uppercase sticky top-0 z-20">
          <tr className="bg-gradient-to-r from-ink-900/95 via-ink-800/95 to-ink-900/95 border-b-2 border-gold-500/40">
            <th scope="col" className="p-3 w-16 text-center">
              <span className="text-gold-400 font-bold">🏅 排名</span>
            </th>
            <th scope="col" className="p-3 w-2/5">
              <span className="text-gold-400 font-bold">⚔️ 修士名号</span>
            </th>
            <th scope="col" className="p-3 w-2/5">
              <span className="text-gold-400 font-bold">🏯 所属势力</span>
            </th>
            <th scope="col" className="p-3 w-1/5 text-right">
              <span className="text-gold-400 font-bold">✨ 积分</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr
              key={entry.rank}
              className={`border-b transition-all duration-300 ${getRankRowClass(entry.rank)} hover:scale-[1.01] hover:shadow-lg`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="p-3 text-center">
                <div className="flex items-center justify-center">
                  {getRankDisplay(entry.rank)}
                </div>
              </td>
              <td className="p-3 truncate">
                <span className={`font-bold ${entry.rank <= 3 ? 'text-gold-300' : 'text-paper-200'}`}>
                  {entry.name}
                </span>
                {entry.rank === 1 && <span className="ml-1 text-xs">👑</span>}
              </td>
              <td className="p-3 truncate">
                <span className="text-paper-400 italic">{entry.faction}</span>
              </td>
              <td className="p-3 text-right">
                <span className={`font-mono font-bold ${entry.rank === 1 ? 'text-yellow-400 text-shadow-glow' :
                    entry.rank === 2 ? 'text-slate-300' :
                      entry.rank === 3 ? 'text-orange-400' :
                        'text-gold-400/80'
                  }`}>
                  {entry.points.toLocaleString()}
                </span>
                {entry.rank <= 3 && <span className="ml-1">⭐</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 底部装饰 */}
      <div className="mt-4 text-center text-paper-500 text-xs">
        <span className="opacity-50">〓</span>
        <span className="mx-2 italic">天道酬勤，道心永固</span>
        <span className="opacity-50">〓</span>
      </div>
    </div>
  );
};

export default LeaderboardTable;