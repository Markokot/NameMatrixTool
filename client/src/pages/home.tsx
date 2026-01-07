import { UserMatrix } from "@/components/matrix/user-matrix";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container py-8 max-w-5xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              <span className="text-primary" style={{ textShadow: '0 0 30px rgba(132, 204, 22, 0.5), 0 0 60px rgba(132, 204, 22, 0.3)' }}>
                Список забегов
              </span>
            </h1>
            <p className="text-white/60 text-lg">Выбирайте забеги и отмечайте свое участие</p>
          </div>
          <UserMatrix />
        </div>
      </div>
    </div>
  );
}