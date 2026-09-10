"use client";
import Link from "next/link";
import type { Product } from "@/lib/core";
import { CATEGORIES } from "@/lib/core";
import { ShopFooter } from "@/components/ui-shell";
import { ProductCard,ProductGrid,SORTS,type SortId } from "@/components/ui-shop-core";
import { useHomeFilters } from "@/components/ui-shop-home-filters";
import { HomeGridEmpty, homeEmptyMode } from "@/components/ui-shop-home-empty";
export function HomeView({
  products,featured,query,category,initialFav=false,initialSort="default",initialStock=false,initialSale=false,initialLow=false,initialFeat=false,initialOos=false,initialRecent=false,initialWatch=false,initialCompare=false,greeting,dateLabel,}: {
  products: Product[];
  featured: Product[];
  query?: string;
  category?: string;
  initialFav?: boolean;
  initialSort?: SortId;
  initialStock?: boolean;
  initialSale?: boolean;
  initialLow?: boolean;
  initialFeat?: boolean;
  initialOos?: boolean;
  initialRecent?: boolean;
  initialWatch?: boolean;
  initialCompare?: boolean;
  greeting: string;
  dateLabel: string;
}) {
  const h=useHomeFilters({
    products,query,category,initialFav,initialSort,initialStock,initialSale,initialLow,initialFeat,initialOos,initialRecent,initialWatch,initialCompare,});
  const listMode=h.favOnly || h.recentOnly || h.watchOnly || h.compareOnly;
  const showFeatured =
    !query && !category && featured.length && h.sort === "default" && !h.inStockOnly && !h.onSaleOnly && !h.lowStockOnly && !h.featuredOnly && !h.outOfStockOnly && !listMode;
  const showRecentRail =
    !query && !category && h.recentProducts.length > 0 && h.sort === "default" && !h.inStockOnly && !h.onSaleOnly && !h.lowStockOnly && !h.featuredOnly && !h.outOfStockOnly && !listMode;
  const showFavRail =
    !query && !category && h.favProducts.length > 0 && h.sort === "default" && !h.inStockOnly && !h.onSaleOnly && !h.lowStockOnly && !h.featuredOnly && !h.outOfStockOnly && !listMode;
  const showWatchRail =
    !query && !category && h.watchProducts.length > 0 && h.sort === "default" && !h.inStockOnly && !h.onSaleOnly && !h.lowStockOnly && !h.featuredOnly && !h.outOfStockOnly && !listMode;
  const showCompareRail =
    !query && !category && h.compareProducts.length > 0 && h.sort === "default" && !h.inStockOnly && !h.onSaleOnly && !h.lowStockOnly && !h.featuredOnly && !h.outOfStockOnly && !listMode;
  const showSaleRail =
    !query && !category && h.saleProducts.length > 0 && h.sort === "default" && !h.inStockOnly && !h.onSaleOnly && !h.lowStockOnly && !h.featuredOnly && !h.outOfStockOnly && !listMode;
  const showLowRail =
    !query && !category && h.lowStockProducts.length > 0 && h.sort === "default" && !h.inStockOnly && !h.onSaleOnly && !h.lowStockOnly && !h.featuredOnly && !h.outOfStockOnly && !listMode;
  const showOosRail =
    !query && !category && h.oosProducts.length > 0 && h.sort === "default" && !h.inStockOnly && !h.onSaleOnly && !h.lowStockOnly && !h.featuredOnly && !h.outOfStockOnly && !listMode;
  return (
    <div className="grid-wrap"><div className="hero-row"><h1>{greeting}</h1><span className="date-line">{dateLabel}</span></div><p className="lede">Keten,yün ve ev. Filtreler URL'de; Kopyala ile paylaş.</p><div className="chips scroll" data-chips="category">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${category === c ? "on" : ""}`} type="button" aria-pressed={category === c} onClick={() => h.pick(c)}>
            {c}
          </button>
        ))}
      </div><div className="chips scroll" data-chips="sort" role="tablist" aria-label="Sırala" style={{ marginTop: 8 }}>
        {SORTS.map((s) => (
          <button key={s.id} className={`chip ${h.sort === s.id ? "on" : ""}`} type="button" aria-pressed={h.sort === s.id} onClick={() => h.setSort(s.id)}>
            {s.label}
          </button>
        ))}
        <button className={`chip ${h.inStockOnly ? "on" : ""}`} type="button" aria-pressed={h.inStockOnly} data-filter="in-stock" onClick={() => h.setInStockOnly(!h.inStockOnly)}>Sadece stokta</button><button className={`chip ${h.onSaleOnly ? "on" : ""}`} type="button" aria-pressed={h.onSaleOnly} data-filter="on-sale" onClick={() => h.setOnSaleOnly((v) => !v)}>İndirimli</button>
        {h.onSaleOnly && h.saleInStock.length ? (
          <button className="chip on" type="button" data-cta="sale-add-all" disabled={h.saleBusy} onClick={() => void h.addAllSaleInStock()}>
            {h.saleBusy ? "ekleniyor…" : `Sepete ekle · ${h.saleInStock.length}`}
          </button>
        ) : null}
        <button className={`chip ${h.lowStockOnly ? "on" : ""}`} type="button" aria-pressed={h.lowStockOnly} data-filter="low-stock" onClick={() => h.setLowStockOnly((v) => !v)}>Az stok</button>
        {h.lowStockOnly && h.lowStockReady.length ? (
          <button className="chip on" type="button" data-cta="low-add-all" disabled={h.lowBusy} onClick={() => void h.addAllLowStock()}>
            {h.lowBusy ? "ekleniyor…" : `Sepete ekle · ${h.lowStockReady.length}`}
          </button>
        ) : null}
        <button className={`chip ${h.outOfStockOnly ? "on" : ""}`} type="button" aria-pressed={h.outOfStockOnly} data-filter="out-of-stock" onClick={() => h.setOutOfStockOnly(!h.outOfStockOnly)}>Tükendi</button><button className={`chip ${h.featuredOnly ? "on" : ""}`} type="button" aria-pressed={h.featuredOnly} data-filter="featured" onClick={() => h.setFeaturedOnly((v) => !v)}>Öne çıkan</button>
        {h.featuredOnly && h.featuredInStock.length ? (
          <button className="chip on" type="button" data-cta="feat-add-all" disabled={h.featBusy} onClick={() => void h.addAllFeatured()}>
            {h.featBusy ? "ekleniyor…" : `Sepete ekle · ${h.featuredInStock.length}`}
          </button>
        ) : null}
        <button className={`chip ${h.favOnly ? "on" : ""}`} type="button" aria-pressed={h.favOnly} data-filter="favorites" onClick={() => h.setFavFilter(!h.favOnly)}>
          Favoriler{h.favIds.length ? ` · ${h.favIds.length}` : ""}
        </button><button className={`chip ${h.recentOnly ? "on" : ""}`} type="button" aria-pressed={h.recentOnly} data-filter="recent" onClick={() => h.setRecentFilter(!h.recentOnly)}>
          Son bakılanlar{h.recentIds.length ? ` · ${h.recentIds.length}` : ""}
        </button>
        {h.recentOnly && h.recentInStock.length ? (
          <button className="chip on" type="button" data-cta="recent-add-all" disabled={h.recentBusy} onClick={() => void h.addAllRecentInStock()}>
            {h.recentBusy ? "ekleniyor…" : `Sepete ekle · ${h.recentInStock.length}`}
          </button>
        ) : null}
        {h.recentOnly && h.recentIds.length ? (
          <button className="chip" type="button" data-cta="clear-recent" onClick={() => { h.clearRecentViews(); h.setRecentFilter(false); }}>Temizle</button>
        ) : null}
        <button className={`chip ${h.watchOnly ? "on" : ""}`} type="button" aria-pressed={h.watchOnly} data-filter="restock-watch" onClick={() => h.setWatchFilter(!h.watchOnly)}>
          Beklediklerim{h.watchIds.length ? ` · ${h.watchIds.length}` : ""}{h.watchBackCount ? ` · ${h.watchBackCount} geldi` : ""}
        </button>
        {h.watchOnly && h.watchInStock.length ? (
          <button className="chip on" type="button" data-cta="watch-add-all" disabled={h.watchBusy} onClick={() => void h.addAllWatchInStock()}>
            {h.watchBusy ? "ekleniyor…" : `Gelenleri ekle · ${h.watchInStock.length}`}
          </button>
        ) : null}
        {h.watchOnly && h.watchIds.length ? (
          <button className="chip" type="button" data-cta="clear-restock-watch" onClick={() => { h.clearRestockWatch(); h.setWatchFilter(false); }}>Temizle</button>
        ) : null}
        {h.favOnly && h.favInStock.length ? (
          <button className="chip on" type="button" data-cta="favorites-add-all" disabled={h.favBusy} onClick={() => void h.addAllFavorites()}>
            {h.favBusy ? "ekleniyor…" : `Sepete ekle · ${h.favInStock.length}`}
          </button>
        ) : null}
        {h.favOnly && h.favIds.length ? (
          <button className="chip" type="button" data-cta="clear-favorites" onClick={() => { h.clearFavorites(); h.setFavFilter(false); }}>Temizle</button>
        ) : null}
        <button className={`chip ${h.compareOnly ? "on" : ""}`} type="button" aria-pressed={h.compareOnly} data-filter="compare" onClick={() => h.setCompareFilter(!h.compareOnly)}>
          Karşılaştırılanlar{h.compareIdsLive.length ? ` · ${h.compareIdsLive.length}` : ""}
        </button>
        {h.compareOnly && h.compareInStock.length ? (
          <button className="chip on" type="button" data-cta="compare-add-all" disabled={h.compareBusy} onClick={() => void h.addAllCompareInStock()}>
            {h.compareBusy ? "ekleniyor…" : `Sepete · ${h.compareInStock.length}`}
          </button>
        ) : null}
        {h.compareOnly && h.compareIdsLive.length ? (
          <button className="chip" type="button" data-cta="clear-compare" onClick={() => { h.clearCompare(); h.setCompareFilter(false); }}>Temizle</button>
        ) : null}
        <button className="chip" type="button" data-cta="home-copy-link" onClick={() => void h.copyLink()}>{h.copied ? "Tamam" : "Kopyala"}</button>
        {h.filtersActive ? (
          <button className="chip" type="button" data-cta="clear-home-filters" onClick={() => h.clearAllFilters()}>
            Temizle
          </button>
        ) : null}
      </div>
      {showSaleRail ? (
        <><div className="section-label" style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span>İndirimliler · {h.saleProducts.length}</span>
            {h.saleInStock.length ? (
              <button
                className="chip on"
                type="button"
                data-cta="sale-rail-add-all"
                disabled={h.saleBusy}
                onClick={() => void h.addAllSaleInStock()}
              >
                {h.saleBusy ? "ekleniyor…" : `Sepete · ${h.saleInStock.length}`}
              </button>
            ) : null}
            <Link className="chip" href="/?sale=1" data-cta="sale-rail-see-all">
              Tümünü gör
            </Link></div><div className="featured" data-rail="sale">{h.saleProducts.slice(0,4).map((p) => (<ProductCard key={p.id} product={p} />))}</div></>
      ) : null}
      {showLowRail ? (
        <><div className="section-label" style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span>Az stok · {h.lowStockProducts.length}</span>
            {h.lowStockReady.length ? (
              <button
                className="chip on"
                type="button"
                data-cta="low-rail-add-all"
                disabled={h.lowBusy}
                onClick={() => void h.addAllLowStock()}
              >
                {h.lowBusy ? "ekleniyor…" : `Sepete · ${h.lowStockReady.length}`}
              </button>
            ) : null}
            <Link className="chip" href="/?low=1" data-cta="low-rail-see-all">
              Tümünü gör
            </Link></div><div className="featured" data-rail="low-stock">{h.lowStockProducts.slice(0,4).map((p) => (<ProductCard key={p.id} product={p} />))}</div></>
      ) : null}
      {showOosRail ? (
        <><div className="section-label" style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span>Tükendi · {h.oosProducts.length}</span><Link className="chip" href="/?oos=1" data-cta="oos-rail-see-all">
              Tümünü gör
            </Link><Link className="chip" href="/?watch=1" data-cta="oos-rail-to-watch">
              Takibe bak
            </Link></div><div className="featured" data-rail="out-of-stock">{h.oosProducts.slice(0,4).map((p) => (<ProductCard key={p.id} product={p} />))}</div></>
      ) : null}
      {showCompareRail ? (
        <><div className="section-label" style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span>Karşılaştırılanlar · {h.compareProducts.length}</span>
            {h.compareInStock.length ? (
              <button
                className="chip on"
                type="button"
                data-cta="compare-rail-add-all"
                disabled={h.compareBusy}
                onClick={() => void h.addAllCompareInStock()}
              >
                {h.compareBusy ? "ekleniyor…" : `Sepete · ${h.compareInStock.length}`}
              </button>
            ) : null}
            <Link className="chip" href="/?cmp=1" data-cta="compare-rail-see-all">
              Tümünü gör
            </Link><button
              className="chip"
              type="button"
              data-cta="compare-rail-clear"
              onClick={() => h.clearCompare()}
            >
              Temizle
            </button></div><div className="featured" data-rail="compare">{h.compareProducts.slice(0,3).map((p) => (<ProductCard key={p.id} product={p} />))}</div></>
      ) : null}
      {showWatchRail ? (
        <><div className="section-label" style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span>Beklediklerim{h.watchBackCount ? ` · ${h.watchBackCount} geldi` : ""}</span>
            {h.watchInStock.length ? (
              <button
                className="chip on"
                type="button"
                data-cta="watch-rail-add-all"
                disabled={h.watchBusy}
                onClick={() => void h.addAllWatchInStock()}
              >
                {h.watchBusy ? "ekleniyor…" : `Gelenleri ekle · ${h.watchInStock.length}`}
              </button>
            ) : null}
            <Link className="chip" href="/?watch=1" data-cta="watch-rail-see-all">
              Tümünü gör
            </Link><button
              className="chip"
              type="button"
              data-cta="watch-rail-clear"
              onClick={() => h.clearRestockWatch()}
            >
              Temizle
            </button></div><div className="featured" data-rail="restock-watch">{h.watchProducts.slice(0,4).map((p) => (<ProductCard key={p.id} product={p} />))}</div></>
      ) : null}
      {showRecentRail ? (
        <><div className="section-label" style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span>Son bakılanlar</span>
            {h.recentInStock.length ? (
              <button
                className="chip on"
                type="button"
                data-cta="recent-rail-add-all"
                disabled={h.recentBusy}
                onClick={() => void h.addAllRecentInStock()}
              >
                {h.recentBusy ? "ekleniyor…" : `Sepete ekle · ${h.recentInStock.length}`}
              </button>
            ) : null}
            <Link className="chip" href="/?recent=1" data-cta="recent-rail-see-all">
              Tümünü gör
            </Link><button
              className="chip"
              type="button"
              data-cta="recent-rail-clear"
              onClick={() => h.clearRecentViews()}
            >
              Temizle
            </button></div><div className="featured" data-rail="recent">{h.recentProducts.slice(0,4).map((p) => (<ProductCard key={p.id} product={p} />))}</div></>
      ) : null}
      {showFavRail ? (
        <><div className="section-label" style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span>Favoriler</span>
            {h.favInStock.length ? (
              <button
                className="chip on"
                type="button"
                data-cta="fav-rail-add-all"
                disabled={h.favBusy}
                onClick={() => void h.addAllFavorites()}
              >
                {h.favBusy ? "ekleniyor…" : `Sepete ekle · ${h.favInStock.length}`}
              </button>
            ) : null}
            <Link className="chip" href="/?fav=1" data-cta="fav-rail-see-all">
              Tümünü gör
            </Link><button
              className="chip"
              type="button"
              data-cta="fav-rail-clear"
              onClick={() => h.clearFavorites()}
            >
              Temizle
            </button></div><div className="featured" data-rail="favorites">{h.favProducts.slice(0,4).map((p) => (<ProductCard key={p.id} product={p} />))}</div></>
      ) : null}
      {showFeatured ? (
        <><div className="section-label" style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span>Öne çıkan · {h.featuredProducts.length || featured.length}</span>
            {h.featuredInStock.length ? (
              <button
                className="chip on"
                type="button"
                data-cta="feat-rail-add-all"
                disabled={h.featBusy}
                onClick={() => void h.addAllFeatured()}
              >
                {h.featBusy ? "ekleniyor…" : `Sepete · ${h.featuredInStock.length}`}
              </button>
            ) : null}
            <Link className="chip" href="/?feat=1" data-cta="feat-rail-see-all">
              Tümünü gör
            </Link></div><div className="featured" data-rail="featured">{(h.featuredProducts.length ? h.featuredProducts : featured).slice(0,4).map((p) => (<ProductCard key={p.id} product={p} />))}</div></>
      ) : null}
      <div className="section-label">
        {query ? `${h.filtered.length} sonuç · ${query}` : h.compareOnly ? `Karşılaştırılanlar · ${h.filtered.length}` : h.favOnly ? `Favoriler · ${h.filtered.length}` : h.recentOnly ? `Son bakılanlar · ${h.filtered.length}` : h.watchOnly ? `Beklediklerim · ${h.filtered.length}` : h.featuredOnly ? `Öne çıkan · ${h.filtered.length}` : h.outOfStockOnly ? `Tükendi · ${h.filtered.length}` : h.lowStockOnly ? `Az stok · ${h.filtered.length}` : category ? category : "Katalog"}
        {h.sort !== "default" ? ` · ${SORTS.find((s) => s.id === h.sort)?.label}` : ""}
        {h.inStockOnly ? " · stokta" : ""}
        {h.onSaleOnly ? " · indirimli" : ""}
        {h.outOfStockOnly && (query || category || h.favOnly || h.recentOnly || h.watchOnly || h.compareOnly || h.onSaleOnly || h.lowStockOnly || h.featuredOnly) ? " · tükendi" : ""}
        {h.featuredOnly && (query || category || h.favOnly || h.recentOnly || h.watchOnly || h.compareOnly || h.onSaleOnly || h.lowStockOnly || h.outOfStockOnly) ? " · öne çıkan" : ""}
        {h.lowStockOnly && (query || category || h.favOnly || h.recentOnly || h.watchOnly || h.compareOnly || h.onSaleOnly || h.featuredOnly || h.outOfStockOnly) ? " · az stok" : ""}
      </div>{h.filtered.length ? (
        <ProductGrid products={h.filtered} />
      ) : (
        <HomeGridEmpty
          mode={homeEmptyMode({
            compareOnly: h.compareOnly,
            watchOnly: h.watchOnly,
            favOnly: h.favOnly,
            recentOnly: h.recentOnly,
            featuredOnly: h.featuredOnly,
            outOfStockOnly: h.outOfStockOnly,
            onSaleOnly: h.onSaleOnly,
            lowStockOnly: h.lowStockOnly,
            inStockOnly: h.inStockOnly,
          })}
          filtersActive={h.filtersActive}
          onClearFilters={h.clearAllFilters}
        />
      )}
      <ShopFooter /></div>
  );
}
