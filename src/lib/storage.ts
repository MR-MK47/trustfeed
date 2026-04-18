import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabase";

/**
 * The current storage engine implementation utilizing Supabase Storage.
 * The backend metadata continues to be saved securely in Firestore.
 */

export async function uploadFile(
  file: File,
  type: "public-images" | "private-docs",
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${type}/${fileName}`;

  // Since Supabase's open source JS client doesn't have a native onProgress for simple uploads, 
  // we trigger start and end progress artificially or rely on native UI.
  if (onProgress) onProgress(0);

  const { data, error } = await supabase
    .storage
    .from('trustfeed-assets') // Make sure this bucket is created in your Supabase dashboard and is public
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Supabase Storage upload error:", error);
    throw error;
  }

  if (onProgress) onProgress(100);

  // Get the public URL for the newly uploaded asset
  const { data: { publicUrl } } = supabase.storage.from('trustfeed-assets').getPublicUrl(filePath);

  return publicUrl;
}
