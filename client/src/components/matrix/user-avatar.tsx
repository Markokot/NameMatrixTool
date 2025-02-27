import { UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const GENDER_MAP: Record<string, "male" | "female"> = {
  "Андрей": "male",
  "Саша": "male",
  "Вася": "male",
  "Виталя": "male",
  "Женя": "male",
  "Аня": "female",
  "Ира": "female",
  "Лида": "female",
};

interface UserAvatarProps {
  name: string;
}

export function UserAvatar({ name }: UserAvatarProps) {
  const gender = GENDER_MAP[name] || "male";
  const bgColor = gender === "male" ? "bg-blue-100" : "bg-pink-100";
  const iconColor = gender === "male" ? "text-blue-500" : "text-pink-500";

  return (
    <Avatar className="h-8 w-8">
      <AvatarFallback className={bgColor}>
        <UserCircle2 className={`h-4 w-4 ${iconColor}`} />
      </AvatarFallback>
    </Avatar>
  );
}