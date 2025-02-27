import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
}

export function UserAvatar({ name }: UserAvatarProps) {
  return (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-primary/10">
        <User className="h-4 w-4 text-primary" />
      </AvatarFallback>
    </Avatar>
  );
}
