
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
}

export function UserAvatar({ name, gender, avatarUrl, onAvatarChange, showUpload = false }: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = gender === "male" ? "bg-blue-100" : "bg-pink-100";
  const iconColor = gender === "male" ? "text-blue-500" : "text-pink-500";

  // Добавляем логирование для отладки
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
      <Avatar className="h-8 w-8">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={name} />
        ) : (
          <AvatarFallback className={bgColor}>
            <UserCircle2 className={`h-4 w-4 ${iconColor}`} />
          </AvatarFallback>
        )}
      </Avatar>

      {showUpload && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
          <label className="cursor-pointer w-full h-full flex items-center justify-center">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
            >
              <Upload className="h-4 w-4 text-white" />
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
