import { UserMatrix } from "@/components/matrix/user-matrix";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container py-8 max-w-5xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Список забегов
            </h1>
            <p className="text-muted-foreground text-lg">Выбирайте забеги и отмечайте свое участие</p>
          </div>
          <UserMatrix />
        </div>
      </div>
    </div>
  );
}
