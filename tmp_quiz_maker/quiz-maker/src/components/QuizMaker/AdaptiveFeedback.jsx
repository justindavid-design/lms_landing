import React from 'react';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * AdaptiveFeedback — displays Claude's per-question or overall feedback.
 *
 * Props:
 *   text       {string}  — feedback text from Claude
 *   loading    {boolean} — show spinner while fetching
 *   isCorrect  {boolean} — controls color scheme (green vs amber)
 *   variant    {string}  — 'question' | 'overall' (slightly different styling)
 */
export default function AdaptiveFeedback({ text, loading, isCorrect, variant = 'question' }) {
  if (!loading && !text) return null;

  const correct  = isCorrect !== false; // default green if undefined (overall)
  const bgColor  = correct ? 'bg-[#EAF3DE]' : 'bg-[#FAEEDA]';
  const border   = correct ? 'border-[#97C459]' : 'border-[#EF9F27]';
  const textClr  = correct ? 'text-[#27500A]' : 'text-[#633806]';
  const Icon     = correct ? LightbulbOutlinedIcon : ErrorOutlineIcon;
  const iconClr  = correct ? '#3B6D11' : '#854F0B';

  return (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${bgColor} ${border} ${textClr}`}
    >
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1a3a28] rounded-full animate-spin flex-shrink-0" />
          <span className="text-xs">Generating adaptive feedback…</span>
        </div>
      ) : (
        <>
          <Icon style={{ fontSize: 18, color: iconClr, marginTop: 1, flexShrink: 0 }} />
          <p>{text}</p>
        </>
      )}
    </div>
  );
}
