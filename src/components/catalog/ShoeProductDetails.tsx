import type { ProductDisplayInfo } from "@/lib/catalog/product-display";
import { formatPrice } from "@/lib/utils";

interface ShoeProductDetailsProps {
  product: ProductDisplayInfo;
}

export function ShoeProductDetails({ product }: ShoeProductDetailsProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Gender", value: product.gender },
          { label: "Style", value: product.style },
          { label: "Color", value: product.color },
          { label: "Material", value: product.material },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[1.25rem] border border-border bg-stone-100/[0.03] p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600">{item.label}</p>
            <p className="mt-2 text-sm text-stone-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-[1.25rem] border border-border bg-stone-100/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Finish Color</p>
          <div className="mt-4 flex items-center gap-3">
            <span
              className="h-10 w-10 rounded-full border border-stone-300/50 shadow-inner"
              style={{ backgroundColor: product.color_hex }}
            />
            <div>
              <p className="text-sm font-medium text-stone-900">{product.color}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Curated finish</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-border bg-stone-100/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Hardware</p>
          <p className="mt-4 text-sm leading-7 text-stone-700">{product.hardware}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-[1.25rem] border border-border bg-stone-100/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Silhouette</p>
          <p className="mt-3 text-sm text-stone-900">{product.silhouette}</p>
        </div>

        <div className="rounded-[1.25rem] border border-border bg-stone-100/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Sizing</p>
          <p className="mt-3 text-sm text-stone-900">{product.sizing}</p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-border bg-stone-100/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Product Details</p>
        <ul className="mt-4 space-y-3">
          {product.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3 text-sm leading-7 text-stone-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {highlight}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-stone-600">
          Price: <span className="font-medium text-stone-900">{formatPrice(product.base_price)}</span>
        </p>
      </div>
    </div>
  );
}
