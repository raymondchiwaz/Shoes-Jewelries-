import { MeiliSearch } from "meilisearch"

export const SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_SEARCH_ENDPOINT ?? ""

const apiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY ?? ""

export interface MeiliSearchProductHit {
  id: string
  handle: string
  title: string
  thumbnail: string
  variants: string[]
}

/**
 * Search is optional. If you don't configure MeiliSearch/Algolia, we keep this `null`
 * to avoid browser-side requests to a non-existent local service (e.g. localhost:7700).
 */
export const searchClient = SEARCH_ENDPOINT
  ? new MeiliSearch({
      host: SEARCH_ENDPOINT,
      apiKey,
    })
  : null
