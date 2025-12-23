import { getCategoriesList } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@medusajs/ui"

export default async function TopCategories() {
  const { product_categories } = await getCategoriesList(0, 12)

  if (!product_categories?.length) {
    return null
  }

  const topLevel = product_categories.filter((c) => !c.parent_category)

  if (!topLevel.length) {
    return null
  }

  return (
    <div className="border-b border-ui-border-base bg-white">
      <div className="content-container py-2 overflow-x-auto no-scrollbar">
        <ul className="flex items-center gap-x-6 whitespace-nowrap">
          {topLevel.slice(0, 8).map((c) => (
            <li key={c.id}>
              <LocalizedClientLink
                href={`/categories/${c.handle}`}
                className="text-ui-fg-subtle hover:text-ui-fg-base"
              >
                <Text>{c.name}</Text>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}