import React from 'react'

interface SummaryProps {
  feedback: any;
}

const Summary = ({ feedback }: SummaryProps) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Summary</h3>
      <p>Overall Score: {feedback?.overallScore}/100</p>
    </div>
  )
}

export default Summary