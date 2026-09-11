import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

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

    return NextResponse.json({ cartItems }, { status: 200 });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { variantId, quantity } = body;

    if (!variantId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Check variant exists and has stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return NextResponse.json(
        { error: 'Product variant not found' },
        { status: 404 }
      );
    }

    const availableStock = variant.stock - variant.reserved;
    if (availableStock < quantity) {
      return NextResponse.json(
        { error: 'Not enough stock' },
        { status: 409 }
      );
    }

    // Add to cart or update quantity
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_variantId: {
          userId: session.user.id,
          variantId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (availableStock < newQuantity) {
        return NextResponse.json(
          { error: 'Not enough stock' },
          { status: 409 }
        );
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          variantId,
          quantity,
        },
      });
    }

    return NextResponse.json(
      { message: 'Added to cart', cartItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
