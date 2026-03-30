import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { preferenceClient } from "@/lib/mercadopago";
import { getPlanById } from "@/config/plans";
import { z } from "zod/v4";

const checkoutSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Email invalido"),
  phone: z.string().optional(),
  plan: z.enum(["basico", "completo", "vip"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, plan: planId } = parsed.data;
    const plan = getPlanById(planId);

    if (!plan) {
      return NextResponse.json(
        { error: "Plano nao encontrado" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        plan: planId,
        amount: plan.priceInCents,
        status: "pending",
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: plan.id,
            title: `Ebook Emagreca sem Dieta - ${plan.name}`,
            quantity: 1,
            unit_price: plan.price,
            currency_id: "BRL",
          },
        ],
        payer: {
          email,
          name,
        },
        back_urls: {
          success: `${baseUrl}/obrigado?payment_id=${order.id}`,
          failure: `${baseUrl}/checkout?canceled=1`,
          pending: `${baseUrl}/obrigado?payment_id=${order.id}&status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhook/mercadopago`,
        external_reference: order.id,
      },
    });

    if (preference.id) {
      await prisma.order.update({
        where: { id: order.id },
        data: { mpPreferenceId: preference.id },
      });
    }

    return NextResponse.json({
      init_point: preference.init_point,
      orderId: order.id,
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao processar checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
