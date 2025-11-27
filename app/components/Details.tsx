import React from 'react'

interface DetailsProps {
  feedback: any;
}

const Details = ({ feedback }: DetailsProps) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Detailed Feedback</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold">Content: {feedback?.content?.score}/100</p>
        </div>
        <div>
          <p className="font-semibold">Structure: {feedback?.structure?.score}/100</p>
        </div>
        <div>
          <p className="font-semibold">Tone & Style: {feedback?.toneAndStyle?.score}/100</p>
        </div>
        <div>
          <p className="font-semibold">Skills: {feedback?.skills?.score}/100</p>
        </div>
      </div>
    </div>
  )
}

export default Details