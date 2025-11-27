import React, { useEffect, useState } from 'react'
import {Link,useNavigate,useParams } from 'react-router';
import { usePuterStore } from '~/lib/puter';

  export const meta = () => ([
    { title: 'Resumind | Review' },
    { name: 'description', content: 'Detailed overview of your resume' },
])


const Resume = () => {
  const {auth,isLoading,fs,kv} =usePuterStore();
  const {id} = useParams();
  const [imageUrl,setImageUrl]=useState('')
  const [resumeUrl,setResumeUrl] =useState('');
  const [feedback,setFeedback] =useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate =useNavigate();

useEffect(() => {
  const loadResume = async () => {
    setLoading(true);
    setError('');
    
    if (!kv || !fs) {
      const msg = 'KV or FS not available';
      console.error(msg);
      setError(msg);
      setLoading(false);
      return;
    }

    try {
      const resume = await kv.get(`resume${id}`);
      if (!resume) {
        const msg = 'Resume not found';
        console.error(msg);
        setError(msg);
        setLoading(false);
        return;
      }

      const data = JSON.parse(resume);

      // PDF
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) {
        const msg = 'Resume blob not found';
        console.error(msg);
        setError(msg);
        setLoading(false);
        return;
      }

      const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(pdfUrl);

      // Image
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) {
        const msg = 'Image blob not found';
        console.error(msg);
        setError(msg);
        setLoading(false);
        return;
      }

      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);

      setFeedback(data.feedback);
      setLoading(false);
    } catch (error) {
      const msg = `Error loading resume: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(msg);
      setError(msg);
      setLoading(false);
    }
  };

  loadResume();
}, [id, kv, fs]);

  return (
    <main className="pt-0">
      <nav className='resume-nav'>
            <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo"  className="w-2.5 h-2.5"/>
                    <span className='text-gray-800 text-sm font-semibold'>Back To Homepage</span>
            </Link>
      </nav>
      
      {loading && (
        <div className='flex items-center justify-center h-screen'>
          <div className='text-center'>
            <img src="/images/resume-scan.gif" alt="Loading..." className='w-32 h-32 mx-auto mb-4' />
            <p className='text-lg'>Loading your resume...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className='flex items-center justify-center h-screen'>
          <div className='text-center'>
            <p className='text-red-500 text-lg mb-4'>Error: {error}</p>
            <Link to="/upload" className='primary-button'>Try Again</Link>
          </div>
        </div>
      )}
      
      {!loading && !error && (
        <div className='flex flex-row w-full max-lg:flex-col-reverse'>
              <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover min-h-screen sticky top-0 p-8 items-center justify-center flex flex-col">
                    {imageUrl && resumeUrl && (
                      <div className='animate-in fade-in duration-1000 gradient-border max-sm:p-0 h-[90%] max-wxl:h-fit w-fit'>
                          <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                            <img src={imageUrl} className="w-full h-full object-contain rounded-2xl" title="resume" />
                          </a>
                      </div>
                    )}
              </section>
              
              <section className="analysis-section p-8 flex-1">
                {feedback && (
                  <div className='space-y-6'>
                    <h1 className='text-3xl font-bold mb-6'>Your Resume Analysis</h1>
                    <div className='prose max-w-none'>
                      {typeof feedback === 'string' ? (
                        <p>{feedback}</p>
                      ) : (
                        <pre className='bg-gray-100 p-4 rounded-lg overflow-auto max-h-96'>
                          {JSON.stringify(feedback, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </section>
        </div>
      )}
    </main>
  )
}

export default Resume