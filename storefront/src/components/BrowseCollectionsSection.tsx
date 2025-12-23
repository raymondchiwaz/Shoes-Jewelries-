import { getCollectionsList } from "@lib/data/collections"
import { BrowseCollectionsGallery } from "@/components/BrowseCollectionsGallery"

export const BrowseCollectionsSection: React.FC<{ className?: string }> = async ({
    className,
}) => {
    const collectionsData = await getCollectionsList(0, 20, [
        "id",
        "title",
        "handle",
        "metadata",
    ])

    if (!collectionsData || collectionsData.collections.length === 0) {
        return null
    }

    // Transform collections to match the expected type
    const collections = collectionsData.collections.map(collection => ({
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        metadata: collection.metadata as {
            image?: { id: string; url: string }
            description?: string
        } | undefined
    }))

    return (
        <BrowseCollectionsGallery
            collections={collections}
            className={className}
        />
    )
}
