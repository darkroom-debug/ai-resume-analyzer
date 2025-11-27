import React from 'react'

interface ATSProps {
  feedback: any;
}

const ATS = ({ feedback }: ATSProps) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">ATS Score</h3>
      <p>Score: {feedback?.ATS?.score}/100</p>
      <ul className="mt-2">
        {feedback?.ATS?.tips?.map((tip: any, idx: number) => (
          <li key={idx} className="text-sm text-gray-700">{tip.tip}</li>
        ))}
      </ul>
    </div>
  )
}

export default ATS