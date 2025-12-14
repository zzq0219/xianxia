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

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data }) => {
  return (
    <div className="w-full h-full">
      <table className="w-full text-sm text-left text-gray-300 table-fixed">
        <thead className="text-xs text-amber-400 uppercase bg-slate-700/50 sticky top-0">
          <tr>
            <th scope="col" className="p-3 w-16 text-center">排名</th>
            <th scope="col" className="p-3 w-2/5">修士名号</th>
            <th scope="col" className="p-3 w-2/5">所属势力</th>
            <th scope="col" className="p-3 w-1/5 text-right">积分</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.rank} className="border-b border-slate-700/50 hover:bg-slate-800/40">
              <td className="p-3 font-medium text-center">
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
              </td>
              <td className="p-3 font-semibold text-white truncate">{entry.name}</td>
              <td className="p-3 truncate">{entry.faction}</td>
              <td className="p-3 font-mono text-right">{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;