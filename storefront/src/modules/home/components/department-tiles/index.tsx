import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function DepartmentTiles() {
  return (
    <div className="content-container py-8">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <LocalizedClientLink href="/categories/shoes">
          <div className="relative h-64 rounded-large overflow-hidden border border-ui-border-base bg-ui-bg-subtle">
            <div className="absolute inset-0 bg-[url('/placeholder-shoes.jpg')] bg-cover bg-center opacity-80" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="bg-white/80 px-4 py-2 rounded-rounded">
                <span className="txt-large">Shop Shoes</span>
              </div>
            </div>
          </div>
        </LocalizedClientLink>

        <LocalizedClientLink href="/categories/jewelry">
          <div className="relative h-64 rounded-large overflow-hidden border border-ui-border-base bg-ui-bg-subtle">
            <div className="absolute inset-0 bg-[url('/placeholder-jewelry.jpg')] bg-cover bg-center opacity-80" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="bg-white/80 px-4 py-2 rounded-rounded">
                <span className="txt-large">Shop Jewelry</span>
              </div>
            </div>
          </div>
        </LocalizedClientLink>
      </div>
    </div>
  )
}