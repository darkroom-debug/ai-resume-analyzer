import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router';
import FileUploder from '~/components/FileUploder';
import Navbar from '~/components/Navbar'
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants';

const upload = () => {
  const {auth,isLoading,fs,ai,kv} =usePuterStore();
  const navigate =useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file,setFile] = useState<File |null >(null);

  const handleFileSelect =(file:File | null)=>{
    setFile(file)
  }

 const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }) => {
  try {
    setIsProcessing(true);
    setStatusText('Uploading the file...');

    // Check if Puter is initialized
    if (!auth || !fs || !ai || !kv) {
      console.error('Puter not initialized:', { auth, fs, ai, kv });
      return setStatusText('Error: Puter services not initialized. Please refresh the page.');
    }

    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) {
      console.error('File upload failed - no response');
      return setStatusText('Error: Failed to upload file');
    }

    setStatusText('Converting to image...');
    const imageFile = await convertPdfToImage(file);
    if (!imageFile || !imageFile.file) {
      console.error('PDF to image conversion failed:', imageFile?.error || 'Unknown error');
      return setStatusText(`Error: ${imageFile?.error || 'Failed to convert PDF'}`);
    }

    setStatusText('Uploading the image...');
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) {
      console.error('Image upload failed - no response');
      return setStatusText('Error: Failed to upload image');
    }

    setStatusText('Preparing data...');
    const uuid = generateUUID();

    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: '',
    };

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText('Analyzing...');
    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription, AIResponseFormat: 'json' })
    );

    if (!feedback) {
      console.error('AI feedback returned null or undefined');
      return setStatusText('Error: Failed to analyze resume');
    }

    const feedbackText =
      typeof feedback.message?.content === 'string'
        ? feedback.message.content
        : feedback.message?.content?.[0]?.text;

    if (!feedbackText) {
      console.error('Could not extract feedback text from response:', feedback);
      return setStatusText('Error: Invalid response format from AI');
    }

    data.feedback = JSON.parse(feedbackText);

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText('Analysis complete, redirecting...');
    console.log('Analysis successful:', data);
    navigate(`/resume/${uuid}`);

  } catch (err) {
    let errorMessage = 'Unknown error';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'object' && err !== null) {
      errorMessage = JSON.stringify(err, null, 2);
    } else {
      errorMessage = String(err);
    }
    
    console.error('Full error object:', err);
    console.error('Formatted error message:', errorMessage);
    setStatusText(`Error: ${errorMessage}`);
    setIsProcessing(false);
  }
};



  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget.closest('form');
  if (!form) return;

  const formData = new FormData(form);
  const companyName = formData.get('company-name') as string;
  const jobTitle = formData.get('job-title') as string;
  const jobDescription = formData.get('job-description') as string;

  if (!file) return;

  handleAnalyze({ companyName, jobTitle, jobDescription, file });
};


  return (
  <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section">
      <div className='page-heading py-16'>
    <h1>Smart feedback for your dream job</h1>
    {isProcessing ? (
      <>
        <h2>{statusText}</h2>
        <img src="/images/resume-scan.gif" className='w-full' />
      </>
    ) : (
      <h2>Drop your resume for an ATS score and improvement tips</h2>
    )}
    {!isProcessing && (
      <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">

        <div className="form-div">
            <label htmlFor="company-name">Company Name</label>
            <input type="text" name="company-name" placeholder="company Name" id="company-name" />
        </div>

        <div className="form-div">
            <label htmlFor="job-title">Job Title</label>
            <input type="text" name="job-title" placeholder="job Title" id="job-title" />
        </div>

        <div className="form-div">
            <label htmlFor="job-description">Job Description</label>
            <textarea  rows={5} name="job-description" placeholder="job Description" />
        </div>

        <div className="form-div">
            <label htmlFor="uploader">Upload Resume</label>
            <FileUploder onFileSelect={handleFileSelect}/>
        </div>

        <button className='primary-button' type='submit'>
          Analyze Resume
        </button>
      </form>
    )}
      </div>
    </section>
  </main>
)}

export default upload;