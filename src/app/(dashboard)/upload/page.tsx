"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/storage";
import { saveMediaMetadata } from "@/lib/db";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [location, setLocation] = useState("");
  const [isAddingNewLocation, setIsAddingNewLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [dbLocations, setDbLocations] = useState<{id: string, name: string}[]>([]);

  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const q = query(collection(db, "locations"), orderBy("name"));
        const snapshot = await getDocs(q);
        const locs = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setDbLocations(locs);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };
    fetchLocations();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      let finalLocation = location;

      if (isAddingNewLocation && newLocationName.trim()) {
        finalLocation = newLocationName.trim();
        // Save precisely new location to Firebase for future reuse
        try {
           await addDoc(collection(db, "locations"), { name: finalLocation });
        } catch (err) {
           console.error("Failed to save new location", err);
        }
      }

      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const url = await uploadFile(
          selectedFiles[i],
          isPrivate ? "private-docs" : "public-images",
          (p) => {
             const overallProgress = ((i/selectedFiles.length) * 100) + (p/selectedFiles.length);
             setProgress(overallProgress);
          }
        );
        uploadedUrls.push(url);
      }

      let aiTags: string[] = [];
      if (uploadedUrls.length > 0) {
        try {
          const tagResp = await fetch("/api/tag-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: uploadedUrls[0] }),
          });
          const tagData = await tagResp.json();
          aiTags = tagData.tags || [];
        } catch (err) {
          console.error("AI Tagging failed", err);
          aiTags = ["impact", "field-work"];
        }
      }

      await saveMediaMetadata({
        uploaderId: user.uid,
        uploaderName: user.displayName || user.email?.split("@")[0] || "Volunteer",
        school: finalLocation,
        isPrivate,
        fileUrls: uploadedUrls,
        description,
        aiTags,
      });

      router.push(isPrivate ? "/vault" : "/feed");
    } catch (error: any) {
      console.error("Upload failed", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col relative pb-24 w-full">
      {/* Header (Task-focused, simple close/back) */}
      <header className="flex items-center justify-between px-6 py-5 bg-surface z-10 sticky top-0">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-[0_4px_32px_rgba(1,45,29,0.04)] text-on-surface hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        <h1 className="font-headline font-bold text-xl tracking-tight text-primary">New Upload</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>
      
      <main className="flex-1 flex flex-col gap-8 px-6 pt-4 pb-8 max-w-2xl mx-auto w-full">
        {/* Dropzone Section */}
        <section className="flex flex-col gap-4">
          <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] sm:aspect-video rounded-full bg-surface-container-low border-2 border-dashed border-primary flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-surface-container transition-colors relative overflow-hidden group">
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              className="hidden" 
              ref={fileInputRef}
              accept="image/*,video/*"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-container/5 pointer-events-none"></div>
            <div className="w-16 h-16 rounded-full bg-surface-container-lowest shadow-[0_8px_32px_rgba(1,45,29,0.08)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            </div>
            <h2 className="font-headline font-bold text-lg text-primary tracking-tight mb-1">Select Photos/Videos</h2>
            <p className="text-sm text-on-surface-variant max-w-[200px]">Tap to browse or drag & drop files here</p>
          </div>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {previews.map((src, index) => (
                <div key={index} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(1,45,29,0.06)]">
                  <img alt="preview" className="w-full h-full object-cover" src={src} />
                  <button onClick={() => removeFile(index)} className="absolute top-1 right-1 w-6 h-6 bg-surface-container-lowest/80 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-lowest transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 shrink-0 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-primary hover:bg-surface-container transition-colors ghost-border">
                <span className="material-symbols-outlined mb-1">add</span>
                <span className="text-xs font-semibold">More</span>
              </button>
            </div>
          )}
        </section>

        {/* Location & Details Section */}
        <section className="flex flex-col gap-6 bg-surface-container-lowest p-6 rounded-[32px] sm:rounded-full shadow-[0_8px_40px_rgba(1,45,29,0.03)] relative">
          <div className="flex flex-col gap-2 relative">
            <div className="flex justify-between items-center mb-1">
              <label className="font-headline font-bold text-primary tracking-tight" htmlFor="location">School / Location</label>
              <button 
                onClick={() => setIsAddingNewLocation(!isAddingNewLocation)}
                className="text-secondary font-semibold text-sm flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                {isAddingNewLocation ? <><span className="material-symbols-outlined text-sm">close</span> Cancel</> : <><span className="material-symbols-outlined text-sm">add</span> Add New</>}
              </button>
            </div>
            
            {isAddingNewLocation ? (
              <div className="relative animate-in fade-in zoom-in duration-200">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">edit</span>
                 <input 
                    type="text"
                    className="w-full bg-primary-container/10 text-on-surface text-base rounded-xl py-4 flex pl-12 pr-4 ghost-border font-medium placeholder:text-primary/50 border-2 border-primary" 
                    id="newLocation"
                    placeholder="Enter new project/school name..."
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    autoFocus
                 />
              </div>
            ) : (
              <div className="relative animate-in fade-in duration-200">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">search</span>
                <select 
                   className="w-full bg-surface-container-highest text-on-surface text-base rounded-xl py-4 flex pl-12 pr-10 appearance-none ghost-border font-medium" 
                   id="location"
                   value={location}
                   onChange={(e) => setLocation(e.target.value)}
                >
                  <option disabled value="">Search projects or schools...</option>
                  <option value="Karnala Trust Project - Panvel, Mumbai">Karnala Trust Project - Panvel, Mumbai</option>
                  <option value="Kibera Primary School - Nairobi">Kibera Primary School - Nairobi</option>
                  <option value="Mwanza Water Project - Tanzania">Mwanza Water Project - Tanzania</option>
                  <option value="Hope Village Clinic - Uganda">Hope Village Clinic - Uganda</option>
                  {dbLocations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-headline font-bold text-primary tracking-tight" htmlFor="description">Description</label>
            <textarea 
               className="w-full bg-surface-container-highest text-on-surface text-base rounded-xl p-4 resize-none ghost-border font-medium placeholder:text-on-surface-variant/60" 
               id="description" 
               placeholder="Share the impact story, context, or updates regarding this upload..." 
               rows={4}
               value={description}
               onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
        </section>

        {/* Visibility Toggles */}
        <section className="flex flex-col gap-4">
          <h3 className="font-headline font-bold text-primary tracking-tight px-2">Visibility</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setIsPrivate(false)}
              className={`flex flex-col items-center gap-2 p-4 rounded-full transition-transform active:scale-95 ${
                !isPrivate ? 'bg-primary text-on-primary shadow-[0_8px_32px_rgba(1,45,29,0.12)]' 
                : 'bg-surface-container-lowest text-on-surface-variant shadow-sm hover:bg-surface-container-low transition-colors ghost-border'
              }`}
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: !isPrivate ? "'FILL' 1" : "'FILL' 0" }}>public</span>
              <span className="font-semibold text-sm">Public Photo Feed</span>
            </button>
            
            <button 
               onClick={() => setIsPrivate(true)}
               className={`flex flex-col items-center gap-2 p-4 rounded-full transition-transform active:scale-95 ${
                isPrivate ? 'bg-secondary text-on-secondary shadow-[0_8px_32px_rgba(0,105,114,0.12)]' 
                : 'bg-surface-container-lowest text-on-surface-variant shadow-sm hover:bg-surface-container-low transition-colors ghost-border'
              }`}
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isPrivate ? "'FILL' 1" : "'FILL' 0" }}>lock</span>
              <span className="font-semibold text-sm">Private Vault</span>
            </button>
          </div>
          <p className="text-xs text-on-surface-variant px-2 mt-1">Public posts appear in the TrustFeed. Vault items are restricted to verified stakeholders.</p>
        </section>
      </main>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-surface/80 backdrop-blur-2xl border-t-0 shadow-[0_-12px_40px_rgba(1,45,29,0.05)] z-40">
        <div className="max-w-2xl mx-auto">
          <button 
            disabled={uploading || selectedFiles.length === 0}
            onClick={handleUpload}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-lg tracking-tight rounded-full py-4 shadow-[0_8px_32px_rgba(1,45,29,0.15)] flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                Uploading {Math.round(progress)}%
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">cloud_upload</span>
                Upload to Cloud
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
