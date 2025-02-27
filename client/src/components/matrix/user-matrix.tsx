import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "./user-avatar";
import { CATEGORIES, USERNAMES, type UserCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function UserMatrix() {
  const { data: categories = [] } = useQuery<UserCategory[]>({
    queryKey: ["/api/categories"],
  });

  const mutation = useMutation({
    mutationFn: async (category: {
      username: string;
      category: string;
      selected: boolean;
    }) => {
      await apiRequest("POST", "/api/categories", category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });

  const isSelected = (username: string, category: string) => {
    return categories.some(
      (c) => c.username === username && c.category === category && c.selected
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr>
            <th className="p-4 text-left font-medium">Имя</th>
            {CATEGORIES.map((category) => (
              <th key={category} className="p-4 text-center font-medium">
                {category}
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
              {CATEGORIES.map((category) => (
                <td key={category} className="p-4 text-center">
                  <Checkbox
                    checked={isSelected(username, category)}
                    onCheckedChange={(checked) => {
                      mutation.mutate({
                        username,
                        category,
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
  );
}
