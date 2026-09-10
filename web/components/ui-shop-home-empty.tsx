"use client";
import Link from "next/link";

export type HomeEmptyMode =
  | "compare"
  | "watch"
  | "fav"
  | "recent"
  | "feat"
  | "oos"
  | "sale"
  | "low"
  | "stock"
  | "default";

const COPY: Record<HomeEmptyMode, { title: string; hint: string }> = {
  compare: {
    title: "Karşılaştırma boş",
    hint: "Kartta Karşılaştır ile ekle; tabloda yan yana bak.",
  },
  watch: {
    title: "Beklediklerin boş",
    hint: "Tükenen üründe Gelince haber ver; stok gelince burada. Takipte ile çıkar.",
  },
  fav: {
    title: "Favori yok",
    hint: "Kalple favoriye ekle.",
  },
  recent: {
    title: "Son bakılan yok",
    hint: "Ürün sayfalarına bakınca birikir.",
  },
  feat: {
    title: "Öne çıkan yok",
    hint: "Öne çıkan yok; filtreyi kapat veya kategori değiştir.",
  },
  oos: {
    title: "Tükenen yok",
    hint: "Tükenen yok; Gelince haber ver ile takip et.",
  },
  sale: {
    title: "İndirimli yok",
    hint: "İndirimli yok; filtreyi kapat veya kategori değiştir.",
  },
  low: {
    title: "Az stok yok",
    hint: "Az stok yok; filtreyi kapat veya stok sırala.",
  },
  stock: {
    title: "Stokta parça yok",
    hint: "Bu süzgeçte stokta ürün yok; filtreyi kapat veya tükenenlere bak.",
  },
  default: {
    title: "Bu süzgeçte parça yok",
    hint: "Başka bir kategori veya arama dene.",
  },
};

export function homeEmptyMode(opts: {
  compareOnly?: boolean;
  watchOnly?: boolean;
  favOnly?: boolean;
  recentOnly?: boolean;
  featuredOnly?: boolean;
  outOfStockOnly?: boolean;
  onSaleOnly?: boolean;
  lowStockOnly?: boolean;
  inStockOnly?: boolean;
}): HomeEmptyMode {
  if (opts.compareOnly) return "compare";
  if (opts.watchOnly) return "watch";
  if (opts.favOnly) return "fav";
  if (opts.recentOnly) return "recent";
  if (opts.featuredOnly) return "feat";
  if (opts.outOfStockOnly) return "oos";
  if (opts.onSaleOnly) return "sale";
  if (opts.lowStockOnly) return "low";
  if (opts.inStockOnly) return "stock";
  return "default";
}

export function HomeGridEmpty({
  mode,
  filtersActive,
  onClearFilters,
}: {
  mode: HomeEmptyMode;
  filtersActive?: boolean;
  onClearFilters?: () => void;
}) {
  const copy = COPY[mode] ?? COPY.default;
  return (
    <div className="empty" data-cta="home-grid-empty" data-empty-mode={mode}>
      <div className="mark" />
      <h3>{copy.title}</h3>
      <p>{copy.hint}</p>
      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {filtersActive && onClearFilters ? (
          <button
            className="chip"
            type="button"
            data-cta="home-empty-clear-filters"
            onClick={onClearFilters}
          >
            Filtreyi temizle
          </button>
        ) : null}
        <Link className="btn" href="/" data-cta="home-empty-to-shop">
          Mağazaya bak
        </Link>
        {mode !== "feat" ? (
          <Link className="btn" href="/?feat=1" data-cta="home-empty-to-feat">
            Öne çıkana bak
          </Link>
        ) : null}
        {mode !== "stock" ? (
          <Link className="btn" href="/?stock=1" data-cta="home-empty-to-stock">
            Stoktakilere bak
          </Link>
        ) : null}
        {mode !== "sale" ? (
          <Link className="btn" href="/?sale=1" data-cta="home-empty-to-sale">
            İndirimlilere bak
          </Link>
        ) : null}
        {mode !== "low" ? (
          <Link className="btn" href="/?low=1" data-cta="home-empty-to-low">
            Az stoka bak
          </Link>
        ) : null}
        {mode !== "oos" ? (
          <Link className="btn" href="/?oos=1" data-cta="home-empty-to-oos">
            Tükenene bak
          </Link>
        ) : null}
        {mode !== "fav" ? (
          <Link className="btn" href="/?fav=1" data-cta="home-empty-to-favorites">
            Favorilere bak
          </Link>
        ) : null}
        {mode !== "recent" ? (
          <Link className="btn" href="/?recent=1" data-cta="home-empty-to-recent">
            Son bakılanlara bak
          </Link>
        ) : null}
        {mode !== "watch" ? (
          <Link className="btn" href="/?watch=1" data-cta="home-empty-to-watch">
            Beklediklerime bak
          </Link>
        ) : null}
        {mode !== "compare" ? (
          <Link className="btn" href="/?cmp=1" data-cta="home-empty-to-compare">
            Karşılaştırılanlara bak
          </Link>
        ) : null}
        <Link className="btn" href="/sepet" data-cta="home-empty-to-cart">
          Sepete git
        </Link>
      </div>
    </div>
  );
}
