import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireVendor } from "@/lib/auth/guard";

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
  const guard = await requireVendor(request);

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

    /*
     * SECURITY:
     *
     * This request must:
     * 1. Exist
     * 2. Still be pending
     * 3. Belong to one of this vendor's products
     */
    const existing =
      await prisma.sellerContactRequest.findFirst({
        where: {
          id: requestId,
          status: "pending",

          product: {
            vendorId:
              guard.vendorProfile.id,
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
            "Request not found or not assigned to your products.",
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
      "Update vendor sample call request error:",
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