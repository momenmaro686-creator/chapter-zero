import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      where: {
        isActive: true,
      },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
