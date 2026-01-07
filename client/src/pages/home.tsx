import { UserMatrix } from "@/components/matrix/user-matrix";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-5xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Список забегов
            </h1>
            <p className="text-muted-foreground">Выбирайте забеги и отмечайте свое участие</p>
          </div>
          <UserMatrix />
        </div>
      </div>
    </div>
  );
}
