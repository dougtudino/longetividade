import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentClient } from "@/lib/mercadopago";
import { generateDownloadToken, getTokenExpiration } from "@/lib/download";
import { sendEmail, buildDeliveryEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    const payment = await paymentClient.get({ id: paymentId });

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const orderId = payment.external_reference;

    if (payment.status === "approved") {
      const downloadToken = generateDownloadToken();
      const tokenExpiresAt = getTokenExpiration();

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "approved",
          mpPaymentId: String(paymentId),
          downloadToken,
          tokenExpiresAt,
        },
      });

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order) {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const downloadUrl = `${baseUrl}/api/download?token=${downloadToken}`;

        const { subject, htmlContent } = buildDeliveryEmail(
          order.name,
          downloadUrl
        );

        try {
          await sendEmail({
            to: order.email,
            toName: order.name,
            subject,
            htmlContent,
          });
        } catch (emailError: unknown) {
          console.error("Failed to send delivery email:", emailError);
        }
      }
    } else if (payment.status === "rejected") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "rejected",
          mpPaymentId: String(paymentId),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
