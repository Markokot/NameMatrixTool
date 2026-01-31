import { UserMatrix } from "@/components/matrix/user-matrix";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/40">
      <UserMatrix />
    </div>
  );
}