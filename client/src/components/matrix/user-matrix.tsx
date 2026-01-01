import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X, Calendar, MapPin, Users, Upload, Trophy } from "lucide-react";
import { type Category, type UserCategory, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserAvatar } from "./user-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMatrix() {
  const [newCategory, setNewCategory] = useState({ name: "", date: "", location: "Москва" });
  const [newUser, setNewUser] = useState({ name: "", gender: "male" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{type: 'user' | 'category', id: number} | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: userCategories = [] } = useQuery<UserCategory[]>({
    queryKey: ["/api/user-categories"],
  });

  const categoryMutation = useMutation({
    mutationFn: async (category: { name: string; date: string; location: string; id?: number }) => {
      if (category.id) {
        await apiRequest("PUT", `/api/categories/${category.id}`, category);
      } else {
        await apiRequest("POST", "/api/categories", category);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCategory({ name: "", date: "", location: "Москва" });
      setEditingCategory(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-categories"] });
    },
  });

  const userMutation = useMutation({
    mutationFn: async (user: { name: string; gender: string; id?: number; avatarUrl?: string }) => {
      if (user.id) {
        await apiRequest("PUT", `/api/users/${user.id}`, user);
      } else {
        await apiRequest("POST", "/api/users", user);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setNewUser({ name: "", gender: "male" });
    },
  });

  const userCategoryMutation = useMutation({
    mutationFn: async (category: {
      userId: number;
      categoryId: number;
      selected: string;
    }) => {
      await apiRequest("POST", "/api/user-categories", category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-categories"] });
    },
  });

  const logoMutation = useMutation({
    mutationFn: async ({ categoryId, file }: { categoryId: number; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await fetch(`/api/categories/${categoryId}/logo`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Ошибка загрузки логотипа');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async ({ userId, file }: { userId: number; file: File }) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch(`/api/users/${userId}/avatar`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Ошибка загрузки аватара');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const getUserCategoryState = (userId: number, categoryId: number) => {
    const userCategory = userCategories.find(
      (c) => c.userId === userId && c.categoryId === categoryId
    );
    return userCategory ? userCategory.selected : "none";
  };

  const confirmDelete = (type: 'user' | 'category', id: number) => {
    setDeleteItem({type, id});
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    if (deleteItem.type === 'user') {
      await apiRequest("DELETE", `/api/users/${deleteItem.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } else {
      deleteCategoryMutation.mutate(deleteItem.id);
    }
    setDeleteDialogOpen(false);
    setDeleteItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg border">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добавить забег
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый забег</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Название</label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Напр: Grom Ski Night"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата (дд.мм)</label>
                <Input
                  value={newCategory.date}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="01.01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Локация</label>
                <Input
                  value={newCategory.location}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Москва"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => categoryMutation.mutate(newCategory)}
                disabled={!newCategory.name || !newCategory.date}
              >
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добавить участника
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый участник</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Имя</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Иван Иванов"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Пол</label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                  value={newUser.gender}
                  onChange={(e) => setNewUser(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
              <Button 
                className="w-full" 
                onClick={() => userMutation.mutate(newUser)}
                disabled={!newUser.name}
              >
                Добавить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Race Blocks */}
      <div className="space-y-4">
        {categories.map((category) => {
          const registeredUsers = users.filter(user => 
            getUserCategoryState(user.id, category.id) !== "none"
          );
          const nonRegisteredUsers = users.filter(user => 
            getUserCategoryState(user.id, category.id) === "none"
          );

<<<<<<< HEAD
          return (
            <Card key={category.id} className="overflow-hidden border-l-4 border-l-primary/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6 items-center">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-2 border-muted shadow-sm">
                        {category.logoUrl ? (
                          <AvatarImage src={category.logoUrl} alt={category.name} />
                        ) : (
                          <AvatarFallback className="bg-muted">
                            <Trophy className="h-10 w-10 text-muted-foreground" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <label className="cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) logoMutation.mutate({ categoryId: category.id, file });
                          }}
                        />
                        <Upload className="h-6 w-6 text-white" />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        <Calendar className="h-3 w-3" />
                        {category.date} 2026
                      </div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        {category.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Plus className="h-3 w-3 rotate-45" />
                        </Button>
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {category.location}
                      </div>
=======
      <div className="w-full mb-4">
        <div className="flex items-center gap-6 ml-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border flex items-center justify-center">
              <svg 
                className="h-5 w-5 text-black" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <span className="text-sm">Планирую участвовать</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border flex items-center justify-center">
              <svg 
                className="h-5 w-5 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <span className="text-sm">Купил слот</span>
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="sticky top-0 bg-background z-10">
              <th className="p-4 text-left font-medium sticky left-0 z-10 bg-background">Имя</th>
              {categories.map((category) => (
                <th key={category.id} className="p-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Input
                        value={category.name}
                        onChange={(e) =>
                          categoryMutation.mutate({
                            id: category.id,
                            name: e.target.value,
                            date: category.date,
                          })
                        }
                        className="text-left font-medium w-24"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => confirmDelete('category', category.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
>>>>>>> ac9400b9984e7eed71eac4362dab42db543b352e
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => confirmDelete('category', category.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-start">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#D9F99D] hover:bg-[#bef264] text-black font-semibold rounded-full px-8 h-11">
                        Регистрация
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Зарегистрировать участника</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[400px] overflow-y-auto space-y-2 py-4">
                        {nonRegisteredUsers.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">Все участники зарегистрированы</p>
                        ) : (
                          nonRegisteredUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <UserAvatar name={user.name} gender={user.gender} avatarUrl={user.avatarUrl} />
                                <span className="text-sm font-medium">{user.name}</span>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => userCategoryMutation.mutate({
                                  userId: user.id,
                                  categoryId: category.id,
                                  selected: "black"
                                })}
                              >
                                Добавить
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Список участников {registeredUsers.length}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {registeredUsers.map((user) => {
                      const status = getUserCategoryState(user.id, category.id);
                      return (
                        <div 
                          key={user.id} 
                          className="flex items-center justify-between p-0.5 rounded-lg border bg-accent/50 border-primary/20 transition-colors h-[52px]"
                        >
                          <div className="flex items-center gap-2 h-full">
                            <div className="h-full flex items-center pl-0.5">
                              <UserAvatar
                                name={user.name}
                                gender={user.gender}
                                avatarUrl={user.avatarUrl}
                                onAvatarChange={(file) => avatarMutation.mutate({ userId: user.id, file })}
                                showUpload={true}
                                className="h-[50px] w-[50px]"
                              />
                            </div>
                            <span className="text-sm font-medium leading-none">{user.name}</span>
                          </div>
                          <div className="flex items-center gap-1 pr-1">
                            <button 
                              onClick={() => {
                                let nextState = "none";
                                // Toggle between 'black' (standard) and 'green' (slot bought)
                                if (status === "green") nextState = "black";
                                else nextState = "green";

                                userCategoryMutation.mutate({
                                  userId: user.id,
                                  categoryId: category.id,
                                  selected: nextState,
                                });
                              }}
                              className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-tight transition-all ${
                                status === "green" 
                                  ? "bg-green-100 border-green-500 text-green-700 opacity-100" 
                                  : "border-muted-foreground/30 text-muted-foreground/30 opacity-40 hover:opacity-60"
                              }`}
                            >
                              Слот
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                // Only remove from this specific race
                                userCategoryMutation.mutate({
                                  userId: user.id,
                                  categoryId: category.id,
                                  selected: "none",
                                });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать забег</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Название</label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата (дд.мм)</label>
                <Input
                  value={editingCategory.date}
                  onChange={(e) => setEditingCategory({ ...editingCategory, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Локация</label>
                <Input
                  value={editingCategory.location}
                  onChange={(e) => setEditingCategory({ ...editingCategory, location: e.target.value })}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => categoryMutation.mutate(editingCategory)}
              >
                Сохранить
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот {deleteItem?.type === 'user' ? 'профиль' : 'забег'}?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
