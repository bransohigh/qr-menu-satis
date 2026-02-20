import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const fakepayRouter = Router();

// ── GET /pay/fake?purchaseId=... ───────────────────────────────────────────
fakepayRouter.get(
  '/fake',
  asyncHandler(async (req: Request, res: Response) => {
    const { purchaseId } = req.query as { purchaseId?: string };
    if (!purchaseId) throw createError('Missing purchaseId', 400);

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { theme: true, user: true },
    });
    if (!purchase) throw createError('Purchase not found', 404);

    if (purchase.status === 'paid') {
      return res.redirect('/admin');
    }

    res.render('pay/fake', {
      purchase,
      theme: purchase.theme,
      user:  purchase.user,
    });
  })
);

// ── POST /pay/fake/confirm ─────────────────────────────────────────────────
fakepayRouter.post(
  '/fake/confirm',
  asyncHandler(async (req: Request, res: Response) => {
    const { purchaseId, action } = req.body as { purchaseId?: string; action?: string };
    if (!purchaseId) throw createError('Missing purchaseId', 400);

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { theme: true },
    });
    if (!purchase) throw createError('Purchase not found', 404);

    if (action === 'cancel') {
      await prisma.purchase.update({
        where: { id: purchaseId },
        data:  { status: 'failed', updatedAt: new Date() },
      });
      return res.redirect('/checkout/cancel');
    }

    // Simulate payment success – call our own webhook internally
    if (purchase.status !== 'paid') {
      // Mark paid
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status:      'paid',
          providerRef: `fake_${purchaseId}`,
          updatedAt:   new Date(),
        },
      });

      // Create Menu for user if not already exists
      const existingMenu = await prisma.menu.findUnique({ where: { userId: purchase.userId } });
      if (!existingMenu) {
        const slug = await generateMenuSlug();
        await prisma.menu.create({
          data: {
            userId:  purchase.userId,
            themeId: purchase.themeId,
            slug,
          },
        });
      }
      console.log(`[fakepay] Purchase ${purchaseId} confirmed → menu ensured for user ${purchase.userId}`);
    }

    res.redirect(`/checkout/success?purchaseId=${purchaseId}`);
  })
);

// ─── helpers ──────────────────────────────────────────────────────────────
function nanoid(n = 6): string {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let r = '';
  for (let i = 0; i < n; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}

async function generateMenuSlug(businessName?: string): Promise<string> {
  const base = businessName
    ? businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'menu'
    : 'menu';
  let slug = `${base}-${nanoid(6)}`;
  while (await prisma.menu.findUnique({ where: { slug } })) {
    slug = `${base}-${nanoid(6)}`;
  }
  return slug;
}
