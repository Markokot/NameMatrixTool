import { UserMatrix } from "@/components/matrix/user-matrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container py-4 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Забег</CardTitle>
        </CardHeader>
        <CardContent>
          <UserMatrix />
        </CardContent>
      </Card>
    </div>
  );
}