import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./user-avatar";
import { Plus } from "lucide-react";
import { USERNAMES, type Category, type UserCategory } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function UserMatrix() {
  const [newCategory, setNewCategory] = useState({ name: "", date: "" });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
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

  const userCategoryMutation = useMutation({
    mutationFn: async (category: {
      username: string;
      categoryId: number;
      selected: boolean;
    }) => {
      await apiRequest("POST", "/api/user-categories", category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-categories"] });
    },
  });

  const isSelected = (username: string, categoryId: number) => {
    return userCategories.some(
      (c) => c.username === username && c.categoryId === categoryId && c.selected
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div>
          <label className="text-sm">Название</label>
          <Input
            value={newCategory.name}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Новая категория"
          />
        </div>
        <div>
          <label className="text-sm">Дата (дд.мм)</label>
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
          Добавить
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="p-4 text-left font-medium">Имя</th>
              {categories.map((category) => (
                <th key={category.id} className="p-4">
                  <div className="space-y-2">
                    <Input
                      value={category.name}
                      onChange={(e) => 
                        categoryMutation.mutate({
                          id: category.id,
                          name: e.target.value,
                          date: category.date
                        })
                      }
                      className="text-center font-medium"
                    />
                    <Input
                      value={category.date}
                      onChange={(e) => 
                        categoryMutation.mutate({
                          id: category.id,
                          name: category.name,
                          date: e.target.value
                        })
                      }
                      pattern="\d{2}\.\d{2}"
                      className="text-center"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERNAMES.map((username) => (
              <tr key={username} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={username} />
                    <span className="font-medium">{username}</span>
                  </div>
                </td>
                {categories.map((category) => (
                  <td key={category.id} className="p-4 text-center">
                    <Checkbox
                      checked={isSelected(username, category.id)}
                      onCheckedChange={(checked) => {
                        userCategoryMutation.mutate({
                          username,
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