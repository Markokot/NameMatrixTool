
import { UserCircle2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface UserAvatarProps {
  name: string;
  gender: string;
  avatarUrl?: string | null;
  onAvatarChange?: (file: File) => void;
  showUpload?: boolean;
  className?: string;
}

export function UserAvatar({ name, gender, avatarUrl, onAvatarChange, showUpload = false, className = "h-7 w-7" }: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = gender === "male" ? "bg-blue-100" : "bg-pink-100";
  const iconColor = gender === "male" ? "text-blue-500" : "text-pink-500";

  useEffect(() => {
    console.log("UserAvatar реднерится с параметрами:", { name, gender, avatarUrl, showUpload });
  }, [name, gender, avatarUrl, showUpload]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input change event triggered");
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
      if (onAvatarChange) {
        console.log("Calling onAvatarChange callback");
        onAvatarChange(file);
      } else {
        console.error("onAvatarChange callback is missing");
      }
    } else {
      console.log("No file selected");
    }
    // Reset input value после выбора файла
    event.target.value = '';
  };

  return (
    <div 
      className="relative group cursor-pointer" 
      onMouseEnter={() => {
        console.log("Mouse enter");
        setIsHovered(true);
      }} 
      onMouseLeave={() => {
        console.log("Mouse leave");
        setIsHovered(false);
      }}
    >
      <Avatar className={className}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
        ) : (
          <AvatarFallback className={bgColor}>
            <UserCircle2 className={`h-1/2 w-1/2 ${iconColor}`} />
          </AvatarFallback>
        )}
      </Avatar>

      {showUpload && (
        <>
          <input
            type="file"
            id={`avatar-upload-${name}`}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <label 
            htmlFor={`avatar-upload-${name}`}
            className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 z-20 cursor-pointer"
          >
            <Upload className="h-1/2 w-1/2 text-white" />
          </label>
        </>
      )}
    </div>
  );
}
