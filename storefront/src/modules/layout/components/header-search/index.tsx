"use client"

import { InstantSearch } from "react-instantsearch-hooks-web"
import { MagnifyingGlassMini } from "@medusajs/icons"
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client"
import SearchBox from "@modules/search/components/search-box"
import Hit from "@modules/search/components/hit"
import Hits from "@modules/search/components/hits"

const HeaderSearch = () => {
  if (!process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED) {
    return null
  }

  return (
    <InstantSearch indexName={SEARCH_INDEX_NAME} searchClient={searchClient}>
      <div className="w-full max-w-xl">
        <div className="w-full flex items-center gap-x-2 px-4 py-2 border border-ui-border-base rounded-rounded bg-white">
          <MagnifyingGlassMini />
          <SearchBox />
        </div>
        <div className="mt-3">
          <Hits hitComponent={Hit} />
        </div>
      </div>
    </InstantSearch>
  )
}

export default HeaderSearch