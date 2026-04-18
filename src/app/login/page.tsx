"use client";

import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getCountFromServer } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const saveUserRole = async (uid: string, email: string | null, displayName: string | null) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);
      
      // Only set role if it's a new document
      if (!userSnap.exists()) {
        const coll = collection(db, "users");
        const countSnap = await getCountFromServer(coll);
        const nextId = countSnap.data().count + 1;

        await setDoc(userDocRef, {
          email,
          name: displayName || email?.split("@")[0] || "Volunteer",
          volunteerId: nextId,
          role: "volunteer",
          createdAt: new Date()
        });
      }
    } catch (err) {
      console.error("Failed to save user role", err);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserRole(userCredential.user.uid, userCredential.user.email, name);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      window.location.href = "/feed";
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await saveUserRole(userCredential.user.uid, userCredential.user.email, userCredential.user.displayName);
      window.location.href = "/feed";
    } catch (err: any) {
      setErrorMsg(err.message || "Google Sign-In failed.");
      setLoading(false);
    }
  };


  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Top Hero Section */}
      <div className="h-[397px] w-full relative shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          title="high quality photo of NGO field workers planting young saplings in a rural field during golden hour with warm sunlight filtering through" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAj_sXcDvEHhFSRi55aUCqf9AUrfMXgtgH08tbtPPrqRRJqpMIvqoaVK-QoW7Sp0jKdYw-WUoHnh5vn488SOv4PeZbfEp2LBMuXmuJPG-NYFUewL8LGSFKoqGkxBt7p9mrMhoWQKJgMxUCvU5nTHtubpVGn4CvYCD11au9T9JnVlys4CV4ZT27fdpwMzJ51K1TzYmjn0yXqeNgRhb9RBU1JeylI7_OvQzHimFTT5PZR6E8DHbmPa7a57huEep0mRa5KceqLxi7gU5VX')" }}
        ></div>
        {/* Soft Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/80 mix-blend-multiply"></div>
        {/* Logo Badge Overlay */}
        <div className="absolute top-8 left-6 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <span className="font-headline font-bold text-on-primary tracking-tight text-xl">TrustFeed</span>
        </div>
      </div>

      {/* Login Form Container (Lifted Card) */}
      <main className="flex-1 bg-surface-container-lowest rounded-t-[32px] -mt-10 relative z-10 px-6 py-8 flex flex-col shadow-[0_-12px_40px_rgba(1,45,29,0.12)]">
        {/* Header Content */}
        <div className="mb-8">
          <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight leading-tight">
            {isSignUp ? "Create an Account." : "Welcome back."}
          </h1>
          <p className="font-body text-on-surface-variant mt-3 text-sm leading-relaxed pr-4">
            {isSignUp ? "Join our community and help track field impact in real-time." : "Welcome, continue your impact. Your community is waiting for the pulse of change."}
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleEmailAuth}>
          {errorMsg && (
            <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {errorMsg}
            </div>
          )}

          {/* Name Input (Only on Sign Up) */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-semibold text-on-surface tracking-wide uppercase" htmlFor="name">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                <input 
                  className="w-full bg-surface-container-highest border-0 ring-1 ring-outline-variant/15 rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none transition-shadow" 
                  id="name" 
                  placeholder="Enter your full name" 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            </div>
          )}
          
          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs font-semibold text-on-surface tracking-wide uppercase" htmlFor="email">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
              <input 
                className="w-full bg-surface-container-highest border-0 ring-1 ring-outline-variant/15 rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none transition-shadow" 
                id="email" 
                placeholder="Enter your email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs font-semibold text-on-surface tracking-wide uppercase" htmlFor="password">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
              <input 
                className="w-full bg-surface-container-highest border-0 ring-1 ring-outline-variant/15 rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none transition-shadow" 
                id="password" 
                placeholder="Enter your password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          
          {/* Main CTA */}
          <button 
            disabled={loading}
            className="mt-4 w-full bg-primary text-on-primary font-body font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(1,45,29,0.2)] disabled:opacity-70" 
            type="submit"
          >
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
            {!loading && <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>arrow_forward</span>}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px bg-surface-container flex-1"></div>
          <span className="font-label text-xs font-medium text-outline">Or login with</span>
          <div className="h-px bg-surface-container flex-1"></div>
        </div>

        {/* Social Logins */}
        <div className="mt-6 flex gap-4">
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex-1 bg-surface-container-low text-primary font-body font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-surface-container transition-colors disabled:opacity-70"
          >
            Google
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-auto pt-8 flex flex-col items-center gap-4">
          <p className="font-body text-sm text-on-surface-variant">
            {isSignUp ? "Already have an account?" : "Don't have an account?"} 
            <button 
              type="button"
              className="ml-1 font-bold text-secondary hover:underline underline-offset-4 decoration-2" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Log In here" : "Create an Account"}
            </button>
          </p>
          <p className="font-label text-xs text-outline tracking-wider uppercase">
            good_neighbors_security
          </p>
        </div>
      </main>
    </div>
  );
}
