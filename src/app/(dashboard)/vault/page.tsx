"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { MediaMetadata } from "@/lib/db";

export default function VaultPage() {
  const [items, setItems] = useState<MediaMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const colRef = collection(db, "media_assets");
    const q = query(
      colRef,
      where("uploaderId", "==", user.uid),
      where("isPrivate", "==", true),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vaultData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as MediaMetadata[];
      setItems(vaultData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-8 px-6 max-w-7xl mx-auto flex flex-col gap-8 pb-32 w-full">
      {/* Header Section */}
      <section className="flex flex-col gap-2 mt-4">
        <h2 className="font-headline font-extrabold text-5xl tracking-tight text-primary">Manage Documents</h2>
        <p className="text-on-surface-variant font-body text-lg">Secure storage for your community initiatives.</p>
      </section>

      {/* Recent Files Section */}
      <section className="mt-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-headline font-bold text-2xl text-on-surface">Recent Uploads</h2>
          <button className="text-primary font-label text-sm font-semibold hover:opacity-80 transition-opacity">View All</button>
        </div>
        <div className="bg-surface-container-low rounded-xl p-2 flex flex-col gap-2">
          {loading ? (
             <div className="flex-1 flex items-center justify-center p-8">
                <span className="material-symbols-outlined animate-spin text-primary text-2xl">progress_activity</span>
             </div>
          ) : items.length === 0 ? (
            <div className="bg-surface-container-lowest p-6 rounded-lg text-center font-body text-on-surface-variant ambient-shadow ghost-border">
                Your private vault is empty.
            </div>
          ) : items.map(item => (
            <div key={item.id} className="bg-surface-container-lowest p-4 rounded-lg flex items-center justify-between ambient-shadow ghost-border hover:bg-surface-variant transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="bg-primary-container/20 w-10 h-10 rounded flex items-center justify-center text-primary overflow-hidden">
                   {item.fileUrls && item.fileUrls[0] ? (
                       <img src={item.fileUrls[0]} className="w-full h-full object-cover" alt="thumb" />
                   ) : (
                       <span className="material-symbols-outlined">description</span>
                   )}
                </div>
                <div>
                  <p className="font-headline font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {item.description ? item.description.substring(0, 30) + '...' : 'Untitled.pdf'}
                  </p>
                  <p className="text-xs text-on-surface-variant font-body mt-1">
                    Uploaded {item.timestamp?.toDate().toLocaleDateString() || "Recently"} • Vaulted
                  </p>
                </div>
              </div>
              <button className="text-on-surface-variant hover:text-primary transition-colors p-2">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
