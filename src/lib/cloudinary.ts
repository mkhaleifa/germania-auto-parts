import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
}

export interface ImageVariants {
  thumbnail: string;
  card: string;
  detail: string;
  zoom: string;
  original: string;
}

function generateSignature(
  params: Record<string, string>
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(sorted + API_SECRET)
    .digest("hex");
}

export function getUploadSignature(
  folder = "products"
) {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params: Record<string, string> = {
    folder,
    timestamp,
  };

  return {
    timestamp,
    signature: generateSignature(params),
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
    folder,
  };
}

export async function uploadImage(
  file: Buffer | string,
  folder = "products"
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params: Record<string, string> = {
    folder,
    timestamp,
  };

  const signature = generateSignature(params);

  const formData = new FormData();

  if (typeof file === "string") {
    formData.append("file", file);
  } else {
    formData.append(
      "file",
      new Blob([new Uint8Array(file)])
    );
  }

  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  return response.json();
}

export function getImageVariants(
  publicId: string
): ImageVariants {
  const base =
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  return {
    thumbnail:
      `${base}/w_200,h_200,c_fill,f_auto,q_80/${publicId}`,

    card:
      `${base}/w_400,h_300,c_fill,f_auto,q_85/${publicId}`,

    detail:
      `${base}/w_800,h_600,c_fill,f_auto,q_90/${publicId}`,

    zoom:
      `${base}/w_1200,h_900,c_fill,f_auto,q_95/${publicId}`,

    original:
      `${base}/f_auto,q_auto/${publicId}`,
  };
}

export async function deleteImage(
  publicId: string
): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params: Record<string, string> = {
    public_id: publicId,
    timestamp,
  };

  const signature = generateSignature(params);

  const formData = new FormData();

  formData.append("public_id", publicId);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Cloudinary image");
  }
}