import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { useEffect, useState } from "react"

const OrderShipRankWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
    const [shipRankData, setShipRankData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchShippingOption = async () => {
            try {
                // Get shipping methods from the order
                const shippingMethods = (data as any).shipping_methods || []
                console.log("Order shipping methods:", shippingMethods)

                if (!shippingMethods || shippingMethods.length === 0) {
                    setLoading(false)
                    return
                }

                // Get the first shipping method (usually there's only one)
                const shipRankMethod = shippingMethods.find((method: any) => {
                    // Check if it's from external-shipping provider or has a known carrier name
                    const providerId = method.shipping_option?.provider_id || ""
                    const name = method.name || method.shipping_option?.name || ""

                    return providerId.includes('external-shipping') ||
                        name.includes('Macrotop') ||
                        name.includes('Forlyfe') ||
                        name.includes('Feisu') ||
                        name.includes('Francis') ||
                        name.includes('FX Express') ||
                        name.includes('Beyond Borders') ||
                        name.includes('Dentad') ||
                        name.includes('Downey') ||
                        name.includes('CTA')
                }) || shippingMethods[0] // Fallback to first method

                if (!shipRankMethod) {
                    setLoading(false)
                    return
                }

                console.log("Selected shipping method:", shipRankMethod)

                // Try to fetch the shipping option details from the API
                if (shipRankMethod.shipping_option_id) {
                    try {
                        const response = await fetch(
                            `/admin/shipping-options/${shipRankMethod.shipping_option_id}`,
                            { credentials: "include" }
                        )

                        if (response.ok) {
                            const result = await response.json()
                            const shippingOption = result.shipping_option

                            if (shippingOption?.data) {
                                setShipRankData({
                                    name: shippingOption.data.name || shippingOption.name || shipRankMethod.name,
                                    rate: shippingOption.data.rate || 0,
                                    shipRankId: shippingOption.data.id || '',
                                    amount: shipRankMethod.amount,
                                    currencyCode: data.currency_code
                                })
                                setLoading(false)
                                return
                            }
                        }
                    } catch (e) {
                        console.log("Could not fetch shipping option, using fallback")
                    }
                }

                // Fallback to method data directly
                setShipRankData({
                    name: shipRankMethod.name || shipRankMethod.shipping_option?.name || "Shipping",
                    rate: shipRankMethod.unit_price || shipRankMethod.amount || 0,
                    shipRankId: shipRankMethod.shipping_option_id || '',
                    amount: shipRankMethod.amount || 0,
                    currencyCode: data.currency_code
                })
            } catch (error) {
                console.error("Failed to fetch shipping option:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchShippingOption()
    }, [data])

    if (loading) {
        return (
            <Container className="p-4">
                <Text className="text-gray-500">Loading shipping details...</Text>
            </Container>
        )
    }

    if (!shipRankData) {
        return (
            <Container className="p-4">
                <Heading level="h2" className="mb-2">Shipping</Heading>
                <Text className="text-gray-500">No shipping selection found.</Text>
            </Container>
        )
    }

    // Format the price
    const formattedRate = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: shipRankData.currencyCode?.toUpperCase() || 'USD'
    }).format((shipRankData.rate || 0) / 100)

    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: shipRankData.currencyCode?.toUpperCase() || 'USD'
    }).format((shipRankData.amount || 0) / 100)

    return (
        <Container className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <Heading level="h2">Shipping Selection</Heading>
                <Badge color="orange" size="small">ShipRank</Badge>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <Text className="font-semibold text-amber-900">{shipRankData.name}</Text>
                        <Text className="text-xs text-amber-600 mt-2">
                            Provider: ShipRank
                        </Text>
                        {shipRankData.shipRankId && (
                            <Text className="text-xs text-gray-500 mt-1 font-mono">
                                ID: {shipRankData.shipRankId}
                            </Text>
                        )}
                    </div>
                    <div className="text-right">
                        <Text className="font-bold text-amber-900">
                            {formattedRate}/kg
                        </Text>
                        <Text className="text-xs text-green-600 font-medium">
                            FREE SHIPPING
                        </Text>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Text className="text-sm text-blue-700">
                    <strong>Note:</strong> Customer selected this shipping option during checkout.
                    Final shipping cost: {formattedAmount}
                </Text>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.details.side.after"
})

export default OrderShipRankWidget
