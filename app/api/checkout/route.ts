import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { CheckoutSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = CheckoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Verify stock and calculate total
    let total = 0;
    const orderItems: Array<{ variantId: string; quantity: number; price: number }> = [];

    for (const item of cartItems) {
      const availableStock = item.variant.stock - item.variant.reserved;
      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${item.variant.product.name}` },
          { status: 409 }
        );
      }

      const itemTotal = item.variant.product.price * item.quantity;
      total += itemTotal;
      orderItems.push({
        variantId: item.variant.id,
        quantity: item.quantity,
        price: item.variant.product.price,
      });
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        governorate: validation.data.governorate,
        city: validation.data.city,
        street: validation.data.street,
        building: validation.data.building,
        apartment: validation.data.apartment,
        phoneNumber: validation.data.phoneNumber,
      },
    });

    // Reserve stock
    for (const item of orderItems) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          reserved: {
            increment: item.quantity,
          },
        },
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        addressId: address.id,
        total,
        paymentMethod: 'CASH_ON_DELIVERY',
        status: 'CONFIRMED',
        items: {
          createMany: {
            data: orderItems.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      },
      include: {
        items: true,
      },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json(
      {
        message: 'Order confirmed',
        order: {
          id: order.id,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
