"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MediaMetadata } from "@/lib/db";

export default function FeedPage() {
  const [posts, setPosts] = useState<MediaMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "media_assets");
    const q = query(
      colRef,
      where("isPrivate", "==", false),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as MediaMetadata[];
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-grow flex flex-col gap-8 px-0 sm:px-4 py-6 max-w-2xl mx-auto w-full">
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">
            progress_activity
          </span>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface-container-lowest flex flex-col gap-4 pb-6 shadow-[0_8px_32px_rgba(1,45,29,0.03)] sm:rounded-xl overflow-hidden p-6 text-center">
            <p className="font-headline font-bold text-xl text-on-surface-variant">No updates yet.</p>
        </div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="bg-surface-container-lowest flex flex-col gap-4 pb-6 shadow-[0_8px_32px_rgba(1,45,29,0.03)] sm:rounded-xl overflow-hidden mb-8">
            {/* Author Header */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline font-bold text-xl shrink-0">
                {post.uploaderName?.substring(0, 2).toUpperCase() || "UN"}
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg text-on-surface tracking-tight leading-tight">
                  {post.uploaderName || "Volunteer"}
                </span>
                <span className="font-body text-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>location_on</span>
                  {post.school || "Field"}, {post.timestamp?.toDate().toLocaleDateString() || "Recently"}
                </span>
              </div>
              <button className="ml-auto p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>more_vert</span>
              </button>
            </div>
            {/* Tags */}
            <div className="flex gap-2 px-4 flex-wrap">
              {post.aiTags?.map((tag) => (
                <span key={tag} className="bg-secondary/10 text-secondary font-label font-semibold text-xs px-3 py-1.5 rounded-full tracking-wide uppercase">
                  {tag}
                </span>
              ))}
            </div>
            {/* Body Text */}
            <div className="px-4 font-body text-on-surface leading-relaxed">
              <p>{post.description}</p>
            </div>
            {/* Primary Image */}
            {post.fileUrls && post.fileUrls.length > 0 && (
              <div className="w-full relative bg-surface-container aspect-square sm:aspect-video overflow-hidden">
                <img alt="Field media" className="w-full h-full object-cover" src={post.fileUrls[0]} />
              </div>
            )}
            {/* Action Bar */}
            <div className="flex items-center gap-6 px-4 pt-2">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>favorite_border</span>
                <span className="font-body text-sm font-medium">0</span>
              </button>
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chat_bubble_outline</span>
                <span className="font-body text-sm font-medium">0</span>
              </button>
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group ml-auto">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>share</span>
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
