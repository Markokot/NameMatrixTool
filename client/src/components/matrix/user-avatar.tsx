
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
    const file = event.target.files?.[0];
    if (file && onAvatarChange) {
      console.log("Файл выбран:", file.name);
      onAvatarChange(file);
    }
    // Reset input value после выбора файла
    event.target.value = '';
  };

  return (
    <div 
      className="relative group" 
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
          <AvatarImage src={avatarUrl} alt={name} />
        ) : (
          <AvatarFallback className={bgColor}>
            <UserCircle2 className={`h-3 w-3 ${iconColor}`} />
          </AvatarFallback>
        )}
      </Avatar>

      {showUpload && isHovered && (
        <label className="cursor-pointer absolute inset-0 flex items-center justify-center z-10">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <Upload className="h-3 w-3 text-white" />
          </div>
        </label>
      )}
    </div>
  );
}
