export interface Category {
  id: string;
  name: string;
  color: string;
}

/** Question categories that have content on the server. */
export const CATEGORIES: Category[] = [
  { id: "dsa", name: "DATA STRUCTURES", color: "text-primary" },
];

export const getCategoryName = (id: string | null | undefined) =>
  CATEGORIES.find((c) => c.id === id)?.name ?? id?.toUpperCase() ?? "";
