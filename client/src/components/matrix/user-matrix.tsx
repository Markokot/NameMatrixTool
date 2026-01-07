import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X, Calendar, MapPin, Users, Upload, Trophy, Edit2, ExternalLink } from "lucide-react";
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
  const [newCategory, setNewCategory] = useState({ name: "", date: "", location: "Москва", url: "" });
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
    mutationFn: async (category: { name: string; date: string; location: string; url?: string | null; id?: number }) => {
      if (category.id) {
        await apiRequest("PUT", `/api/categories/${category.id}`, category);
      } else {
        await apiRequest("POST", "/api/categories", category);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCategory({ name: "", date: "", location: "Москва", url: "" });
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
      // Invalidate both users and categories to be sure
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
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
            <Button size="sm" className="w-[160px] bg-[#10b981] hover:bg-[#059669] text-white">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Ссылка на страницу старта</label>
                <Input
                  value={newCategory.url}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <Button 
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white" 
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
            <Button size="sm" className="w-[160px] bg-[#10b981] hover:bg-[#059669] text-white">
              <Users className="h-4 w-4 mr-2" />
              Участники
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Список всех участников</DialogTitle>
            </DialogHeader>
            <div className="flex justify-end pb-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#10b981] hover:bg-[#059669] text-white">
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
                      className="w-full bg-[#10b981] hover:bg-[#059669] text-white" 
                      onClick={() => userMutation.mutate(newUser)}
                      disabled={!newUser.name}
                    >
                      Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-6">
              {users.map((user) => {
                const userRegistrations = userCategories.filter(uc => uc.userId === user.id && uc.selected !== "none");
                
                return (
                  <div key={user.id} className="flex gap-4 p-4 rounded-lg border bg-accent/30">
                    <UserAvatar 
                      name={user.name} 
                      gender={user.gender} 
                      avatarUrl={user.avatarUrl} 
                      className="h-20 w-20 flex-shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold">{user.name}</h3>
                      <div className="space-y-1">
                        {userRegistrations.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">Нет регистраций на забеги</p>
                        ) : (
                          userRegistrations.map((reg) => {
                            const race = categories.find(c => c.id === reg.categoryId);
                            if (!race) return null;
                            
                            return (
                              <div key={race.id} className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{race.name}</span>
                                <span className="text-muted-foreground">({race.date})</span>
                                {reg.selected === "green" && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[#10b981] text-[10px] font-bold uppercase">
                                    Слот куплен
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

          return (
            <Card key={category.id} className="overflow-hidden border-l-4 border-l-[#10b981] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6 items-center">
                    <div className="relative group">
                      <div className="h-24 w-36 border-2 border-muted shadow-sm rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {category.logoUrl ? (
                          <img 
                            src={`${category.logoUrl}${category.logoUrl.includes('?') ? '&' : '?'}t=${Date.now()}`} 
                            alt={category.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Trophy className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <label className="cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-md">
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
                      <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-wider font-semibold">
                        <Calendar className="h-4 w-4" />
                        {category.date} 2026
                      </div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        {category.url ? (
                          <a 
                            href={category.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors flex items-center gap-2"
                          >
                            {category.name}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          category.name
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {category.location}
                      </div>
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
                      <Button className="bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-full px-8 h-11">
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
                                <span className="text-base font-medium">{user.name}</span>
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
                            <div className="h-full flex items-center pl-0.5 pointer-events-auto">
                              <UserAvatar
                                name={user.name}
                                gender={user.gender}
                                avatarUrl={user.avatarUrl}
                                onAvatarChange={(file) => {
                                  console.log("Avatar change triggered for user:", user.id);
                                  avatarMutation.mutate({ userId: user.id, file });
                                }}
                                showUpload={true}
                                className="h-[50px] w-[50px]"
                              />
                            </div>
                            <span className="text-base font-medium leading-none">{user.name}</span>
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
                                  ? "bg-emerald-100 border-[#10b981] text-[#10b981] opacity-100" 
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Ссылка на страницу старта</label>
                <Input
                  value={editingCategory.url || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, url: e.target.value })}
                  placeholder="https://..."
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
