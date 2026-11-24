export interface PreparedPhoto {
  dataUrl: string;
  base64: string;
  mimeType: "image/jpeg";
}

/** Downscale to maxSide and re-encode as JPEG so the upload stays under serverless body limits. */
export async function preparePhoto(file: File, maxSide = 1600): Promise<PreparedPhoto> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("We couldn't read that file. Please use a JPG, PNG or WebP photo."));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    return { dataUrl, base64: dataUrl.split(",")[1], mimeType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}
