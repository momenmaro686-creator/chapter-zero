import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Removed from cart' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: {
        variant: true,
      },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    const availableStock = cartItem.variant.stock - cartItem.variant.reserved;
    if (availableStock < quantity) {
      return NextResponse.json(
        { error: 'Not enough stock' },
        { status: 409 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
    });

    return NextResponse.json(
      { message: 'Cart updated', cartItem: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
