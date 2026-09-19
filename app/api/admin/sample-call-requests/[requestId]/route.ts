import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

const statusSchema = z.object({
  status: z.enum(["approved", "rejected"]),

  rejectionReason: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),
});

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ requestId: string }>;
  }
) {
  const guard = await requireStaff(request);

  if ("error" in guard) {
    return NextResponse.json(
      {
        success: false,
        error: guard.error,
      },
      {
        status: guard.status,
      }
    );
  }

  try {
    const { requestId } = await params;

    const body = statusSchema.parse(
      await request.json()
    );

    if (
      body.status === "rejected" &&
      !body.rejectionReason?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A rejection reason is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.sellerContactRequest.findFirst({
        where: {
          id: requestId,
          status: "pending",

          /*
           * Admin is allowed to manage only
           * admin-owned products.
           */
          product: {
            vendorId: null,
          },
        },

        select: {
          id: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Request not found or it belongs to a vendor-owned product.",
        },
        { status: 404 }
      );
    }

    const updated =
      await prisma.sellerContactRequest.update({
        where: {
          id: requestId,
        },

        data: {
          status: body.status,

          rejectionReason:
            body.status === "rejected"
              ? body.rejectionReason!.trim()
              : null,

          reviewedByUserId:
            guard.user.id,

          reviewedAt: new Date(),

          assignedToUserId:
            guard.user.id,
        },
      });

    return NextResponse.json({
      success: true,

      data: {
        id: updated.id,
        status: updated.status,
        rejectionReason:
          updated.rejectionReason,

        reviewedAt:
          updated.reviewedAt?.toISOString() ??
          null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status update.",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error(
      "Update admin sample call request error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Could not update the request.",
      },
      { status: 500 }
    );
  }
}