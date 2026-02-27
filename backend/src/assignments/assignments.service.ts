import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  // List assignments; optional date range filter
  async list(opts?: { startDate?: string; endDate?: string }) {
    const where: any = {};
    if (opts?.startDate || opts?.endDate) {
      where.date = {} as any;
      if (opts.startDate) where.date.gte = new Date(opts.startDate);
      if (opts.endDate) where.date.lte = new Date(opts.endDate);
    }
    return this.prisma.assignment.findMany({ where, orderBy: { date: 'asc' } });
  }

  // Create manual assignment (source MANUAL)
  createManual(data: { date: string | Date; workerId?: number | null; note?: string | null }) {
    return this.prisma.assignment.create({ data: { date: new Date(data.date), workerId: data.workerId ?? null, note: data.note ?? null, source: 'MANUAL' } as any });
  }

  // Remove by id
  remove(id: number) {
    return this.prisma.assignment.delete({ where: { id } });
  }

  // Generate recurrent assignments for an interval
  async generate(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // load recurring patterns, workers, and holidays
    const patterns = await this.prisma.recurringPattern.findMany({ include: { worker: true } });
    const holidays = await this.prisma.holiday.findMany();

    // helper to check holiday: exact date or recurring yearly
    const isHoliday = (d: Date) => {
      return holidays.some(h => {
        const hd = new Date(h.date);
        if (h.recurring) {
          return hd.getUTCDate() === d.getUTCDate() && hd.getUTCMonth() === d.getUTCMonth();
        }
        return hd.toISOString().slice(0,10) === d.toISOString().slice(0,10);
      });
    };

    const created: any[] = [];

    // iterate each pattern and generate dates
    for (const p of patterns) {
      const patternStart = p.startDate ? new Date(p.startDate) : start;
      const patternEnd = p.endDate ? new Date(p.endDate) : end;

      const genStart = patternStart > start ? patternStart : start;
      const genEnd = patternEnd < end ? patternEnd : end;
      if (genStart > genEnd) continue;

      // iterate days from genStart to genEnd
      for (let d = new Date(genStart); d <= genEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        const weekday = d.getUTCDay();
        if (!p.weekdays.includes(weekday)) continue;
        if (isHoliday(d)) continue;

        // check existing assignment
        const existing = await this.prisma.assignment.findUnique({ where: { date: new Date(d) as any } }).catch(()=>null);
        if (existing) {
          // keep manual assignments; if existing is RECURRENT, skip (already present)
          continue;
        }

        try {
          const createdRow = await this.prisma.assignment.create({ data: { date: new Date(d), workerId: p.workerId, source: 'RECURRENT', note: p.note ?? null } as any });
          created.push(createdRow);
        } catch (e) {
          // ignore unique constraint errors or others
          continue;
        }
      }
    }

    return { createdCount: created.length };
  }
}
