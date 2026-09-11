import { hash, compare } from 'bcryptjs';
import { prisma } from './db';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}

export async function getUserByPhoneNumber(phoneNumber: string) {
  return prisma.user.findUnique({
    where: { phoneNumber },
    include: {
      vipLevel: true,
    },
  });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function createUser(
  phoneNumber: string,
  username: string,
  password: string
) {
  const hashedPassword = await hashPassword(password);

  return prisma.user.create({
    data: {
      phoneNumber,
      username,
      password: hashedPassword,
    },
    include: {
      vipLevel: true,
    },
  });
}
