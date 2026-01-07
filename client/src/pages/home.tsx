import { UserMatrix } from "@/components/matrix/user-matrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container py-6 max-w-4xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Список забегов</h1>
          <p className="text-muted-foreground">Выбирайте забеги и отмечайте свое участие</p>
        </div>
        <UserMatrix />
      </div>
    </div>
  );
}