import { Skeleton } from "@/components/ui/Skeleton"

export const SkeletonMobileCheckoutSummaryTrigger = () => (
  <button
    type="button"
    className="h-18 flex justify-between items-center w-full group"
    data-open="no"
  >
    <p>Order summary</p>
    <div className="flex items-center gap-4">
      <Skeleton colorScheme="white" className="h-6 w-20" />
      <Skeleton colorScheme="white" className="h-6 w-6" />
    </div>
  </button>
)

export default SkeletonMobileCheckoutSummaryTrigger
