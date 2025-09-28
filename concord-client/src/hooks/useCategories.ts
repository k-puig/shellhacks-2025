import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api-client";

// Get categories by instance ID
export const useCategoriesByInstance = (instanceId: string | undefined) => {
  return useQuery({
    queryKey: ["categories", instanceId],
    queryFn: () =>
      instanceId
        ? categoryApi.getCategoriesByInstance(instanceId)
        : Promise.resolve([]),
    enabled: !!instanceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single category by ID
export const useCategoryById = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: () =>
      categoryId
        ? categoryApi.getCategoryById(categoryId)
        : Promise.resolve(null),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: (data, variables) => {
      // Invalidate categories for the instance
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.instanceId],
      });
      // Also invalidate instance details to refresh the sidebar
      queryClient.invalidateQueries({
        queryKey: ["instance", variables.instanceId],
      });
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      ...data
    }: {
      categoryId: string;
      id: string;
      name?: string;
      description?: string;
      position?: number;
      userId: string;
    }) => categoryApi.updateCategory(categoryId, data),
    onSuccess: (data, variables) => {
      // Update the specific category in cache
      queryClient.invalidateQueries({
        queryKey: ["category", variables.categoryId],
      });
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // Invalidate instance details
      queryClient.invalidateQueries({ queryKey: ["instance"] });
    },
    onError: (error) => {
      console.error("Failed to update category:", error);
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      userId,
    }: {
      categoryId: string;
      userId: string;
    }) => categoryApi.deleteCategory(categoryId, userId),
    onSuccess: (data, variables) => {
      // Remove the category from cache
      queryClient.removeQueries({
        queryKey: ["category", variables.categoryId],
      });
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // Invalidate instance details
      queryClient.invalidateQueries({ queryKey: ["instance"] });
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
    },
  });
};

// Delete all categories by instance mutation
export const useDeleteAllCategoriesByInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      instanceId,
      userId,
    }: {
      instanceId: string;
      userId: string;
    }) => categoryApi.deleteAllCategoriesByInstance(instanceId, userId),
    onSuccess: (data, variables) => {
      // Remove all categories for this instance from cache
      queryClient.removeQueries({
        queryKey: ["categories", variables.instanceId],
      });
      queryClient.removeQueries({ queryKey: ["category"] });
      // Invalidate instance details
      queryClient.invalidateQueries({
        queryKey: ["instance", variables.instanceId],
      });
    },
    onError: (error) => {
      console.error("Failed to delete all categories:", error);
    },
  });
};
