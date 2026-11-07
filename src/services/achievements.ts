import { getMemberAuthSession, getAdminHeaders } from "./applications";

const API_BASE_URL = typeof window !== "undefined" ? "/api/proxy" : "https://eduhub-api-uz1z.onrender.com/api";

export interface AchievementImageItem {
  id: string;
  url: string;
  is_cover: boolean;
  caption?: string;
}

export interface MemberAchievementItem {
  id: string;
  title: string;
  category: "project" | "freelance_job" | "certificate" | "employment" | "competition" | "other" | string;
  description: string;
  date_achieved: string;
  link_url?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  has_image?: boolean;
  images?: AchievementImageItem[];
  images_count?: number;
  skills_used?: string;
  created_at?: string;
}

export interface CreateAchievementPayload {
  title: string;
  category: string;
  description?: string;
  date_achieved?: string;
  link_url?: string;
  skills_used?: string;
  cover_index?: number;
  image?: File | null;
  images?: File[];
  image_base64?: string;
  image_mime?: string;
}

export async function compressImageClientSide(
  file: File,
  maxDimension = 1400,
  quality = 0.82
): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/") || file.size < 250 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

function buildAchievementBody(payload: CreateAchievementPayload): { body: BodyInit; headers: Record<string, string> } {
  const hasFiles = (payload.images && payload.images.length > 0) || payload.image instanceof File;

  if (hasFiles) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("category", payload.category);
    if (payload.description) formData.append("description", payload.description);
    if (payload.date_achieved) formData.append("date_achieved", payload.date_achieved);
    if (payload.link_url) formData.append("link_url", payload.link_url);
    if (payload.skills_used) formData.append("skills_used", payload.skills_used);
    formData.append("cover_index", String(payload.cover_index ?? 0));

    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((img) => {
        formData.append("images[]", img);
      });
    } else if (payload.image instanceof File) {
      formData.append("image", payload.image);
    }

    return { body: formData, headers: {} };
  }

  return {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  };
}

/**
 * Fetch authenticated member's personal achievements
 */
export async function getMemberAchievementsApi(): Promise<MemberAchievementItem[]> {
  try {
    const session = getMemberAuthSession();
    const token = session?.token;
    if (!token) return [];

    const res = await fetch(`${API_BASE_URL}/member/achievements`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    console.error("Failed to fetch member achievements:", err);
    return [];
  }
}

/**
 * Add a new achievement for the authenticated member (with multiple project images)
 */
export async function createMemberAchievementApi(
  payload: CreateAchievementPayload
): Promise<{ success: boolean; data?: MemberAchievementItem; message?: string }> {
  try {
    const session = getMemberAuthSession();
    const token = session?.token;
    if (!token) {
      return { success: false, message: "يرجى تسجيل الدخول أولاً لإضافة إنجاز." };
    }

    if (payload.images && payload.images.length > 0) {
      payload.images = await Promise.all(
        payload.images.map((img) => compressImageClientSide(img))
      );
    } else if (payload.image instanceof File) {
      try {
        payload.image = await compressImageClientSide(payload.image);
      } catch {
        // fallback to raw file
      }
    }

    const { body, headers } = buildAchievementBody(payload);

    const res = await fetch(`${API_BASE_URL}/member/achievements`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...headers,
      },
      body,
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json?.message || "تعذر حفظ الإنجاز، يرجى مراجعة البيانات.",
      };
    }

    return {
      success: true,
      data: json?.data,
      message: json?.message || "تم حفظ الإنجاز بنجاح!",
    };
  } catch (err) {
    console.error("Failed to create achievement:", err);
    return {
      success: false,
      message: "حدث خطأ أثناء الاتصال بالخادم.",
    };
  }
}

/**
 * Delete member's achievement
 */
export async function deleteMemberAchievementApi(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const session = getMemberAuthSession();
    const token = session?.token;
    if (!token) {
      return { success: false, message: "غير مصرح." };
    }

    const res = await fetch(`${API_BASE_URL}/member/achievements/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json?.message || "تعذر حذف الإنجاز." };
    }

    return { success: true, message: json?.message || "تم حذف الإنجاز." };
  } catch (err) {
    console.error("Failed to delete achievement:", err);
    return { success: false, message: "حدث خطأ في الاتصال بالخادم." };
  }
}

/**
 * Admin: Fetch achievements of a specific member
 */
export async function getAdminMemberAchievementsApi(memberId: string | number): Promise<MemberAchievementItem[]> {
  try {
    const headers = getAdminHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/members/${memberId}/achievements`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    console.error("Failed to fetch member achievements for admin:", err);
    return [];
  }
}

/**
 * Admin: Add an achievement for a specific member (with multiple images & cover selection)
 */
export async function createAdminMemberAchievementApi(
  memberId: string | number,
  payload: CreateAchievementPayload
): Promise<{ success: boolean; data?: MemberAchievementItem; message?: string }> {
  try {
    if (payload.images && payload.images.length > 0) {
      payload.images = await Promise.all(
        payload.images.map((img) => compressImageClientSide(img))
      );
    } else if (payload.image instanceof File) {
      try {
        payload.image = await compressImageClientSide(payload.image);
      } catch {
        // fallback to raw file
      }
    }

    const { body, headers } = buildAchievementBody(payload);
    const adminHeaders = getAdminHeaders(headers);

    const res = await fetch(`${API_BASE_URL}/admin/members/${memberId}/achievements`, {
      method: "POST",
      headers: adminHeaders,
      body,
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json?.message || "تعذر حفظ الإنجاز." };
    }

    return { success: true, data: json?.data, message: json?.message || "تم حفظ الإنجاز للعضو بنجاح!" };
  } catch (err) {
    console.error("Failed to add achievement by admin:", err);
    return { success: false, message: "حدث خطأ في الاتصال بالسيرفر." };
  }
}

/**
 * Admin: Delete an achievement
 */
export async function deleteAdminMemberAchievementApi(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = getAdminHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/achievements/${id}`, {
      method: "DELETE",
      headers,
    });

    const json = await res.json();
    return { success: res.ok, message: json?.message || "تم حذف الإنجاز." };
  } catch (err) {
    console.error("Failed to delete achievement by admin:", err);
    return { success: false, message: "فشل الحذف." };
  }
}
