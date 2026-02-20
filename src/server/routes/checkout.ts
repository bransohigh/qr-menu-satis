import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { getPaymentProvider } from '../payments';

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

export const checkoutRouter = Router();

// ── POST /api/checkout ── Create pending purchase → redirect to provider ───
checkoutRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { themeId } = req.body as { themeId?: string };
    if (!themeId) throw createError('themeId is required', 400);

    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) throw createError('Theme not found', 404);

    // Check if user already has a paid purchase for any theme – MVP: one purchase = one menu
    const existingPaid = await prisma.purchase.findFirst({
      where: { userId: req.user!.id, status: 'paid' },
    });
    if (existingPaid) {
      // Already paid – ensure menu exists and redirect to admin
      const menu = await prisma.menu.findUnique({ where: { userId: req.user!.id } });
      if (!menu) {
        // Edge case: paid but no menu – create one now
        const slug = await generateMenuSlug();
        await prisma.menu.create({
          data: { userId: req.user!.id, themeId, slug },
        });
      }
      res.json({ redirect: '/admin', message: 'You already have an active plan' });
      return;
    }

    const provider = getPaymentProvider();
    const amount   = Number(theme.price);
    const currency = theme.currency || 'USD';

    // Create pending purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId:   req.user!.id,
        themeId:  theme.id,
        amount,
        currency,
        status:   'pending',
        provider: process.env.PAYMENT_PROVIDER || 'fakepay',
      },
    });

    // Get provider checkout session
    const session = await provider.createCheckout(purchase.id, theme.id, amount, currency);

    // Store providerRef (session ID) on the purchase
    await prisma.purchase.update({
      where: { id: purchase.id },
      data:  { providerRef: session.sessionId },
    });

    res.json({ redirectUrl: session.redirectUrl, purchaseId: purchase.id });
  })
);

// ── POST /api/webhooks/payment ── Provider posts here on payment success ───
// Raw body access required to verify provider signatures.
checkoutRouter.post(
  '/webhook',
  asyncHandler(async (req: Request, res: Response) => {
    const rawBody  = JSON.stringify(req.body); // FakePay just sends JSON
    const sig      = (req.headers['x-payment-signature'] as string) || '';
    const provider = getPaymentProvider();
    const result   = provider.verifyWebhook(rawBody, sig);

    if (!result.valid) {
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }

    // purchaseId comes from the body (FakePay) or from verifyWebhook result (real providers)
    const purchaseId = (req.body as { purchaseId?: string }).purchaseId || result.purchaseId;
    if (!purchaseId) {
      res.status(400).json({ error: 'purchaseId missing' });
      return;
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { theme: true },
    });
    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }
    if (purchase.status === 'paid') {
      res.json({ ok: true, message: 'Already paid' });
      return;
    }

    // Mark paid
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status:      'paid',
        providerRef: result.providerRef || purchase.providerRef,
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

    console.log(`[payment] Purchase ${purchaseId} paid → menu created for user ${purchase.userId}`);
    res.json({ ok: true });
  })
);

// ── GET /checkout/success ──────────────────────────────────────────────────
checkoutRouter.get(
  '/success',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const purchaseId = req.query.purchaseId as string | undefined;
    let purchase = null;
    if (purchaseId) {
      purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { theme: true },
      });
    }
    res.render('checkout/success', { user: req.user || null, purchase });
  })
);

// ── GET /checkout/cancel ───────────────────────────────────────────────────
checkoutRouter.get(
  '/cancel',
  optionalAuth,
  asyncHandler(async (_req: Request, res: Response) => {
    res.render('checkout/cancel', { user: null });
  })
);
