export type MemberCategory = "طالب/ة" | "فريلانسر Freelancer" | "باحث عن عمل وتطوير مهارات";

export type GenderType = "male" | "female";

export type PhotographyConsentType = "أوافق" | "لا أوافق" | "";

export type DataAccuracyConsentType =
  | "أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه."
  | "لا أوافق"
  | "";

export interface Step1PersonalInfoProps {
  email: string;
  setEmail: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  gender: GenderType;
  setGender: (val: GenderType) => void;
  nationalId: string;
  setNationalId: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  governorate: string;
  setGovernorate: (val: string) => void;
  detailedAddress: string;
  setDetailedAddress: (val: string) => void;
  isRTL: boolean;
  onClearValidation: () => void;
}

export interface Step2AcademicWorkProps {
  category: MemberCategory;
  setCategory: (val: MemberCategory) => void;
  university: string;
  setUniversity: (val: string) => void;
  specialty: string;
  setSpecialty: (val: string) => void;
  primaryPurposes: string[];
  togglePurpose: (purpose: string) => void;
  customPurpose: string;
  setCustomPurpose: (val: string) => void;
  durationSchedule: string;
  setDurationSchedule: (val: string) => void;
  proofFile: File | null;
  setProofFile: (file: File | null) => void;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => void;
  isRTL: boolean;
}

export interface Step3DevicePowerProps {
  deviceType: string;
  setDeviceType: (val: string) => void;
  customDevice: string;
  setCustomDevice: (val: string) => void;
  chargerWattage: string;
  setChargerWattage: (val: string) => void;
  chargerPhoto: File | null;
  setChargerPhoto: (file: File | null) => void;
  powerConnectivityStatus: string;
  setPowerConnectivityStatus: (val: string) => void;
  customConnectivity: string;
  setCustomConnectivity: (val: string) => void;
  preferredShift: string;
  setPreferredShift: (val: string) => void;
  weeklyUsage: string;
  setWeeklyUsage: (val: string) => void;
  customWeeklyUsage: string;
  setCustomWeeklyUsage: (val: string) => void;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => void;
  isRTL: boolean;
}

export interface Step4DeclarationsProps {
  photographyConsent: PhotographyConsentType;
  setPhotographyConsent: (val: PhotographyConsentType) => void;
  dataAccuracyConsent: DataAccuracyConsentType;
  setDataAccuracyConsent: (val: DataAccuracyConsentType) => void;
  isRTL: boolean;
}

export interface ApplicationSuccessViewProps {
  fullName: string;
  phone: string;
  email: string;
  category: MemberCategory;
  gender: GenderType;
  governorate: string;
  submittedAppNumber: string;
  onReset: () => void;
  isRTL: boolean;
}

/**
 * Compresses an image file client-side before sending over HTTP
 * Reduces mobile camera photos (typically 5MB - 12MB) to ~200-400KB
 * ensuring fast uploads and avoiding PHP / Vercel body limits.
 */
export async function compressImageIfNeeded(
  file: File | null,
  maxDimension = 1600,
  quality = 0.82
): Promise<File | null> {
  if (!file || typeof window === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  // Already lightweight, skip compression
  if (file.size < 500 * 1024) {
    return file;
  }

  return new Promise<File>((resolve) => {
    try {
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
              if (!blob || blob.size >= file.size) {
                resolve(file);
              } else {
                const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                const compressedFile = new File([blob], safeName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
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
    } catch {
      resolve(file);
    }
  });
}

