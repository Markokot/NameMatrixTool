import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X, Calendar, MapPin, Users, Settings2 } from "lucide-react";
import { type Category, type UserCategory, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserAvatar } from "./user-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export function UserMatrix() {
  const [newCategory, setNewCategory] = useState({ name: "", date: "" });
  const [newUser, setNewUser] = useState({ name: "", gender: "male" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{type: 'user' | 'category', id: number} | null>(null);

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
    mutationFn: async (category: { name: string; date: string; id?: number }) => {
      if (category.id) {
        await apiRequest("PUT", `/api/categories/${category.id}`, category);
      } else {
        await apiRequest("POST", "/api/categories", category);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCategory({ name: "", date: "" });
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

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-categories"] });
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
      deleteUserMutation.mutate(deleteItem.id);
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

          return (
            <Card key={category.id} className="overflow-hidden border-l-4 border-l-primary/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                      <Calendar className="h-3 w-3" />
                      {category.date} 2026
                    </div>
                    <CardTitle className="text-xl font-bold">{category.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      г. Москва
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
                <div className="flex flex-wrap gap-2">
                  <Button 
                    className="bg-[#D9F99D] hover:bg-[#bef264] text-black font-semibold rounded-full px-6"
                    onClick={() => {
                      // Logic for self-registration or marking participation
                      // For now, let's keep it simple: opens a participant list or handles current user logic
                    }}
                  >
                    Регистрация
                  </Button>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Список участников ({registeredUsers.length})
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {users.map((user) => {
                      const status = getUserCategoryState(user.id, category.id);
                      return (
                        <div 
                          key={user.id} 
                          className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                            status !== "none" ? "bg-accent/50 border-primary/20" : "bg-background"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={user.name}
                              gender={user.gender}
                              avatarUrl={user.avatarUrl}
                              onAvatarChange={(file) => avatarMutation.mutate({ userId: user.id, file })}
                              showUpload={true}
                            />
                            <span className="text-sm font-medium">{user.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => {
                                let nextState = "none";
                                if (status === "none") nextState = "black";
                                else if (status === "black") nextState = "green";
                                else if (status === "green") nextState = "none";

                                userCategoryMutation.mutate({
                                  userId: user.id,
                                  categoryId: category.id,
                                  selected: nextState,
                                });
                              }}
                              className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${
                                status === "green" ? "bg-green-100 border-green-500 text-green-600" :
                                status === "black" ? "bg-primary/10 border-primary text-primary" :
                                "hover:bg-accent"
                              }`}
                            >
                              {status !== "none" && (
                                <svg 
                                  className="h-5 w-5" 
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
                              )}
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => confirmDelete('user', user.id)}
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
