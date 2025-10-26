import { prisma } from '../../lib/prisma';
import type { ToolboxRowInput } from './toolbox.schema';

export async function getToolboxRows(userId: number) {
  return prisma.toolboxRow.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function saveToolboxRows(userId: number, rows: ToolboxRowInput[]) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.toolboxRow.findMany({
      where: { userId },
      select: { id: true },
    });

    const incomingIds = rows.filter((row) => row.id).map((row) => row.id!) as number[];
    const toDelete = existing.filter((row) => !incomingIds.includes(row.id)).map((row) => row.id);

    if (toDelete.length > 0) {
      await tx.toolboxRow.deleteMany({
        where: {
          id: { in: toDelete },
          userId,
        },
      });
    }

    const upserted = await Promise.all(
      rows.map((row) => {
        if (row.id) {
          return tx.toolboxRow.update({
            where: { id: row.id, userId },
            data: {
              label: row.label,
              content: row.content,
            },
          });
        }

        return tx.toolboxRow.create({
          data: {
            userId,
            label: row.label,
            content: row.content,
          },
        });
      })
    );

    return upserted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  });
}
