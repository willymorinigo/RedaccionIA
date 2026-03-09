import { User } from "../types";

interface BrandingLogoProps {
  user: User;
  size?: "sm" | "md" | "lg";
}

export default function BrandingLogo({ user, size = "md" }: BrandingLogoProps) {
  const branding = user.branding;
  
  const sizeClasses = {
    sm: "w-10 h-10 text-xl",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-3xl"
  };

  if (branding?.logoUrl) {
    return (
      <img 
        src={branding.logoUrl} 
        alt={user.newsroom || "Logo"} 
        className={`${size === "sm" ? "h-10" : size === "md" ? "h-14" : "h-20"} object-contain`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-brand-primary rounded-lg flex items-center justify-center text-white font-serif italic`}>
      {user.newsroom ? user.newsroom.charAt(0) : "R"}
    </div>
  );
}
