import { Skeleton } from "@/components/ui/Skeleton"

export const SkeletonMobileCheckoutSummaryTrigger = () => (
  <button
    type="button"
    className="h-18 flex justify-between items-center w-full group"
    data-open="no"
    disabled
  >
    <Skeleton colorScheme="white" className="h-6 w-30" />
    <Skeleton colorScheme="white" className="h-6 w-30" />
  </button>
)

export default SkeletonMobileCheckoutSummaryTrigger
