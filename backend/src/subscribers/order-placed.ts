import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

interface ShipRankCarrier {
  id: string
  name: string
  amount: number
  amount_formatted: string
  currency_code: string
  estimated_days: string | null
  provider: string
}

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)

  // Parse ShipRank carrier from order metadata
  let shipRankCarrier: ShipRankCarrier | null = null
  if (order.metadata?.shiprank_carrier) {
    try {
      shipRankCarrier = typeof order.metadata.shiprank_carrier === 'string'
        ? JSON.parse(order.metadata.shiprank_carrier)
        : order.metadata.shiprank_carrier as ShipRankCarrier
      console.log('Order placed with ShipRank carrier:', shipRankCarrier?.name)
    } catch (e) {
      console.error('Failed to parse ShipRank carrier from order metadata:', e)
    }
  }

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: 'info@example.com',
          subject: 'Your order has been placed'
        },
        order,
        shippingAddress,
        shipRankCarrier,
        preview: 'Thank you for your order!'
      }
    })
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }

  // Emit Segment track event if configured
  try {
    const key = process.env.SEGMENT_WRITE_KEY
    if (key) {
      await fetch('https://api.segment.io/v1/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64'),
        },
        body: JSON.stringify({
          userId: order.customer_id || order.email,
          event: 'Order Placed',
          properties: {
            order_id: order.id,
            value: (order as any)?.summary?.total || 0,
            currency: (order as any)?.currency_code || 'USD',
            items: ((order as any)?.items || []).map((i: any) => ({ id: i.product_id, quantity: i.quantity })),
            shipping_carrier: shipRankCarrier?.name || null,
            shipping_price: shipRankCarrier?.amount_formatted || null,
            shipping_estimated_days: shipRankCarrier?.estimated_days || null,
          },
        }),
      })
    }
  } catch (err) { }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}

