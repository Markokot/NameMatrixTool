import { useEffect } from "react";
import { UserMatrix } from "@/components/matrix/user-matrix";
import { initTelegram } from "@/lib/telegram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <div className="container py-4 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Матрица категорий пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          <UserMatrix />
        </CardContent>
      </Card>
    </div>
  );
}
