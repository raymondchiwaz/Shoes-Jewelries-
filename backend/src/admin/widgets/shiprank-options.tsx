import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Text, Badge, Table, Alert } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ShippingOption = {
  id: string
  name: string
  amount: number
  currency_code: string
  data?: {
    estimated_days_min?: number
    estimated_days_max?: number
  }
}

const ShipRankOptionsWidget = () => {
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fallback options when API is unavailable
  const fallbackOptions: ShippingOption[] = [
    {
      id: "standard-shipping",
      name: "Standard Shipping",
      amount: 1500,
      currency_code: "usd",
      data: { estimated_days_min: 5, estimated_days_max: 7 }
    },
    {
      id: "express-shipping",
      name: "Express Shipping",
      amount: 3000,
      currency_code: "usd",
      data: { estimated_days_min: 2, estimated_days_max: 3 }
    },
    {
      id: "economy-shipping",
      name: "Economy Shipping",
      amount: 800,
      currency_code: "usd",
      data: { estimated_days_min: 7, estimated_days_max: 14 }
    }
  ]

  const [usingFallback, setUsingFallback] = useState(false)

  const fetchOptions = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    setUsingFallback(false)
    try {
      const response = await fetch("/admin/sync-shipping-options", {
        method: "GET",
        credentials: "include"
      })
      const data = await response.json()
      if (data.success && data.options && data.options.length > 0) {
        setOptions(data.options)
        if (data.is_fallback) {
          setUsingFallback(true)
          setError(data.message || "Using fallback options - ShipRank API unavailable")
        } else {
          setUsingFallback(false)
          setError(null)
          setSuccessMessage(`✓ Successfully loaded ${data.options.length} shipping options from ShipRank API`)
        }
      } else {
        // Use fallback options
        setOptions(fallbackOptions)
        setUsingFallback(true)
        setError(data.message || "Using fallback options - ShipRank API unavailable")
      }
    } catch (err: any) {
      // Use fallback options on network error
      setOptions(fallbackOptions)
      setUsingFallback(true)
      setError(`Network error: ${err.message || "ShipRank API unavailable"} - showing default shipping options`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  return (
    <Container className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2">ShipRank Shipping Options</Heading>
        <Button 
          variant="secondary" 
          onClick={fetchOptions}
          isLoading={loading}
        >
          Refresh from API
        </Button>
      </div>

      {successMessage && !error && (
        <div className="mb-4 p-3 border rounded-md bg-green-50 border-green-200">
          <Text className="text-green-700">{successMessage}</Text>
        </div>
      )}

      {error && (
        <div className={`mb-4 p-3 border rounded-md ${usingFallback ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <Text className={usingFallback ? 'text-yellow-700' : 'text-red-700'}>
            {usingFallback ? '⚠️ ' : '❌ '}{error}
          </Text>
        </div>
      )}

      {options.length === 0 && !loading && !error && (
        <Text className="text-gray-500">
          No shipping options found. Make sure your ShipRank API is configured correctly.
        </Text>
      )}

      {options.length > 0 && (
        <>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>ID (for reference)</Table.HeaderCell>
                <Table.HeaderCell>Base Price</Table.HeaderCell>
                <Table.HeaderCell>Delivery Time</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {options.map((option) => (
                <Table.Row key={option.id}>
                  <Table.Cell>
                    <Text className="font-medium">{option.name}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="small">{option.id}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {formatPrice(option.amount, option.currency_code)}
                  </Table.Cell>
                  <Table.Cell>
                    {option.data?.estimated_days_min && option.data?.estimated_days_max
                      ? `${option.data.estimated_days_min}-${option.data.estimated_days_max} days`
                      : "N/A"}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <Heading level="h3" className="text-blue-800 mb-2">
              How to use these options:
            </Heading>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Click "Add Shipping Option" above</li>
              <li>Select <strong>external-shipping</strong> as the Fulfillment Provider</li>
              <li>Set <strong>Price Type</strong> to "Calculated" for dynamic pricing from the API</li>
              <li>The shipping price will be calculated based on item weight at checkout</li>
            </ol>
          </div>
        </>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "location.details.before"
})

export default ShipRankOptionsWidget
