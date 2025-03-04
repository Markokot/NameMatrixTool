import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./user-avatar";
import { Plus, X } from "lucide-react";
import { type Category, type UserCategory, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function UserMatrix() {
  const [newCategory, setNewCategory] = useState({ name: "", date: "" });
  const [newUser, setNewUser] = useState({ name: "", gender: "male" });

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
      selected: boolean;
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

      if (!response.ok) {
        throw new Error('Ошибка загрузки аватара');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const handleAvatarChange = (userId: number, file: File) => {
    avatarMutation.mutate({ userId, file });
  };

  const isSelected = (userId: number, categoryId: number) => {
    return userCategories.some(
      (c) => c.userId === userId && c.categoryId === categoryId && c.selected
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-sm">Название</label>
          <Input
            value={newCategory.name}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Новый забег"
          />
        </div>
        <div className="w-32">
          <label className="text-sm">Дата</label>
          <Input
            value={newCategory.date}
            onChange={(e) => setNewCategory(prev => ({ ...prev, date: e.target.value }))}
            placeholder="дд.мм"
            pattern="\d{2}\.\d{2}"
          />
        </div>
        <Button
          onClick={() => categoryMutation.mutate(newCategory)}
          disabled={!newCategory.name || !newCategory.date}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить забег
        </Button>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-sm">Имя</label>
          <Input
            value={newUser.name}
            onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Новый участник"
          />
        </div>
        <div className="w-32">
          <label className="text-sm">Пол</label>
          <select
            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
            value={newUser.gender}
            onChange={(e) => setNewUser(prev => ({ ...prev, gender: e.target.value }))}
          >
            <option value="male">М</option>
            <option value="female">Ж</option>
          </select>
        </div>
        <Button
          onClick={() => userMutation.mutate(newUser)}
          disabled={!newUser.name}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить участника
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="sticky top-0 bg-background z-10">
              <th className="p-4 text-left font-medium sticky left-0 z-10 bg-background">Имя</th>
              {categories.map((category) => (
                <th key={category.id} className="p-4">
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
                        className="text-center font-medium"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={category.date}
                      onChange={(e) =>
                        categoryMutation.mutate({
                          id: category.id,
                          name: category.name,
                          date: e.target.value,
                        })
                      }
                      className="text-center w-24 mx-auto"
                      pattern="\d{2}\.\d{2}"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4 sticky left-0 z-10 bg-background">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={user.name}
                        gender={user.gender}
                        avatarUrl={user.avatarUrl}
                        onAvatarChange={(file) => handleAvatarChange(user.id, file)}
                        showUpload={true}
                      />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => deleteUserMutation.mutate(user.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
                {categories.map((category) => (
                  <td key={category.id} className="p-4 text-center">
                    <Checkbox
                      checked={isSelected(user.id, category.id)}
                      onCheckedChange={(checked) => {
                        userCategoryMutation.mutate({
                          userId: user.id,
                          categoryId: category.id,
                          selected: checked === true,
                        });
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}