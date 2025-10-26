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

    const incomingIds = rows.filter((row) => row.id).map((row) => row.id!) ?? [];
    const toDelete = existing
      .filter((row) => !incomingIds.includes(row.id))
      .map((row) => row.id);

    if (toDelete.length > 0) {
      await tx.toolboxRow.deleteMany({
        where: {
          id: { in: toDelete },
          userId,
        },
      });
    }

    const promises = rows.map((row, index) => {
      if (row.id) {
        return tx.toolboxRow.update({
          where: { id: row.id, userId },
          data: {
            toolboxLabel: row.toolboxLabel,
            content: row.content,
          },
        });
      }

      return tx.toolboxRow.create({
        data: {
          userId,
          toolboxLabel: row.toolboxLabel,
          content: row.content,
        },
      });
    });

    const updatedRows = await Promise.all(promises);

    return updatedRows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  });
}
