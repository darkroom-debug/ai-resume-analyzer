import { resumes } from "../../constants";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import {Link, useNavigate,useLocation} from "react-router";
import {useEffect, useState} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
    const { auth } = usePuterStore();
    const navigate = useNavigate();
    const { search } = useLocation();

    const next = search?.split('next=')[1];
    
    useEffect(() => {
        if(!auth.isAuthenticated) navigate('/auth?next=/');
    }, [auth.isAuthenticated])


  return <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-no-repeat bg-center">
    <Navbar />

    <section className="main-section">
      <div className="page-heading py-16">
      <h1>Track Your Application & Resume Rating</h1>
      <h2>Review Your submission and check AI-Powerd feedback.</h2>
      </div>
    {/* resume loding part */}
    {resumes.length >0 &&(
       <div className="resumes-section">
      {resumes.map((resume)=>(
      <ResumeCard key={resume.id} resume={resume}  />
    ))}
    </div>

    )}

    </section>

  </main>
}