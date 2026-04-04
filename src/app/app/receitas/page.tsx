"use client";
import { useEffect, useState, useCallback } from "react";
import { AppNav } from "@/components/app/app-nav";

type Recipe = {
  id: string;
  name: string;
  category: "cafe" | "almoco_jantar" | "lanche" | "sobremesa";
  pillar: "S" | "E" | "M";
  prepTime: number;
  serves: number;
  ingredients: string[];
  steps: string[];
  tip: string;
  isFavorite: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "Cafe",
  almoco_jantar: "Almoco/Jantar",
  lanche: "Lanche",
  sobremesa: "Sobremesa",
};

const CATEGORY_COLORS: Record<string, string> = {
  cafe: "#8B6914",
  almoco_jantar: "#639922",
  lanche: "#FF9800",
  sobremesa: "#E91E63",
};

const PILLAR_COLORS: Record<string, string> = {
  S: "#639922",
  E: "#FFC107",
  M: "#378ADD",
};

const PILLAR_LABELS: Record<string, string> = {
  S: "Simplicidade",
  E: "Equilibrio",
  M: "Movimento",
};

const CATEGORY_TABS = [
  { key: "todas", label: "Todas" },
  { key: "cafe", label: "Cafe" },
  { key: "almoco_jantar", label: "Almoco/Jantar" },
  { key: "lanche", label: "Lanches" },
  { key: "sobremesa", label: "Sobremesas" },
];

const PILLAR_CHIPS = [
  { key: "todas", label: "Todas" },
  { key: "S", label: "S" },
  { key: "E", label: "E" },
  { key: "M", label: "M" },
];

export default function ReceitasPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [pillarFilter, setPillarFilter] = useState("todas");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    const params = new URLSearchParams();
    if (categoryFilter !== "todas") params.set("category", categoryFilter);
    if (pillarFilter !== "todas") params.set("pillar", pillarFilter);

    const res = await fetch(`/api/app/recipes?${params.toString()}`);
    const data = await res.json();
    setRecipes(data.recipes ?? []);
    setLoading(false);
  }, [categoryFilter, pillarFilter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const toggleFavorite = async (recipeId: string) => {
    const res = await fetch("/api/app/recipes/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId }),
    });
    if (res.ok) {
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r
        )
      );
    }
  };

  const displayed = showFavoritesOnly
    ? recipes.filter((r) => r.isFavorite)
    : recipes;

  return (
    <div className="px-5 pb-24 pt-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Receitas S.E.M</h1>
        <p className="text-sm text-gray-400">30 receitas praticas para o dia a dia</p>
      </div>

      {/* Category tabs */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategoryFilter(tab.key)}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all"
            style={{
              backgroundColor: categoryFilter === tab.key ? "#639922" : "#f3f4f6",
              color: categoryFilter === tab.key ? "white" : "#6b7280",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pillar chips + Favorites toggle */}
      <div className="mb-4 flex items-center gap-2">
        {PILLAR_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setPillarFilter(chip.key)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all"
            style={{
              backgroundColor:
                pillarFilter === chip.key
                  ? chip.key === "todas"
                    ? "#374151"
                    : PILLAR_COLORS[chip.key]
                  : "#f3f4f6",
              color: pillarFilter === chip.key ? "white" : "#6b7280",
            }}
          >
            {chip.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
          style={{
            backgroundColor: showFavoritesOnly ? "#FFF0F0" : "#f3f4f6",
            color: showFavoritesOnly ? "#E53935" : "#6b7280",
            border: showFavoritesOnly ? "1px solid #fcd4d4" : "1px solid transparent",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={showFavoritesOnly ? "#E53935" : "none"} stroke={showFavoritesOnly ? "#E53935" : "#6b7280"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Favoritas
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: "#639922" }} />
        </div>
      )}

      {/* Recipe list */}
      {!loading && displayed.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">
            {showFavoritesOnly ? "Nenhuma receita favorita ainda" : "Nenhuma receita encontrada"}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {displayed.map((recipe) => {
          const isExpanded = expandedId === recipe.id;

          return (
            <div
              key={recipe.id}
              className="overflow-hidden rounded-2xl bg-white transition-all"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
            >
              {/* Card header (clickable) */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                {/* Pillar dot */}
                <div
                  className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: PILLAR_COLORS[recipe.pillar] }}
                  title={PILLAR_LABELS[recipe.pillar]}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{recipe.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[recipe.category] }}
                    >
                      {CATEGORY_LABELS[recipe.category]}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {recipe.prepTime} min
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {recipe.serves} {recipe.serves === 1 ? "porcao" : "porcoes"}
                    </span>
                  </div>
                </div>

                {/* Favorite heart */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                  }}
                  className="flex-shrink-0 p-1 transition-transform active:scale-90"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={recipe.isFavorite ? "#E53935" : "none"}
                    stroke={recipe.isFavorite ? "#E53935" : "#d1d5db"}
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                {/* Expand indicator */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  className={`flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-gray-50 px-4 pb-4">
                  {/* Ingredients */}
                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-gray-700 mb-1.5">Ingredientes</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-gray-700 mb-1.5">Modo de preparo</h4>
                    <ol className="space-y-2">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-xs text-gray-600">
                          <span
                            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: PILLAR_COLORS[recipe.pillar] }}
                          >
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tip */}
                  <div
                    className="mt-4 rounded-xl p-3"
                    style={{ backgroundColor: "#EAF3DE" }}
                  >
                    <p className="text-xs font-bold mb-1" style={{ color: "#3B6D11" }}>
                      Dica S.E.M
                    </p>
                    <p className="text-xs" style={{ color: "#3B6D11" }}>
                      {recipe.tip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AppNav />
    </div>
  );
}
