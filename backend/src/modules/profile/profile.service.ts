import { prisma } from '../../lib/prisma';
import type { ProfileUpdateInput } from './profile.schema';

export async function getOrCreateProfile(principal: string) {
  const profile = await prisma.user.findUnique({
    where: { principal },
    select: {
      id: true,
      principal: true,
      codename: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (profile) {
    return profile;
  }

  return prisma.user.create({
    data: {
      principal,
      codename: `AGENT-${principal.slice(-4).toUpperCase()}`,
    },
    select: {
      id: true,
      principal: true,
      codename: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateProfile(principal: string, data: ProfileUpdateInput) {
  const profile = await prisma.user.upsert({
    where: { principal },
    update: {
      ...data,
    },
    create: {
      principal,
      codename: data.codename ?? `AGENT-${principal.slice(-4).toUpperCase()}`,
      avatarUrl: data.avatarUrl,
    },
    select: {
      id: true,
      principal: true,
      codename: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return profile;
}
