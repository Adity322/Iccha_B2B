import { prisma } from '@/lib/db';

export class AdminDashboardService {
  static async getDashboard() {
    const [
      pendingKyc,
      totalKyc,
      activeOrders,
      activeProducts,
      lowStockProducts,
      approvedRetailers,
      activeVendors,
      recentKyc,
      recentOrders,
    ] = await Promise.all([
      // ---------------------------------------------------------
      // Pending KYC
      // ---------------------------------------------------------
      prisma.kYCApplication.count({
        where: {
          status: {
            in: [
              'APPLICATION_RECEIVED',
              'UNDER_REVIEW',
              'ADDITIONAL_INFORMATION_REQUIRED',
            ],
          },
        },
      }),

      // ---------------------------------------------------------
      // Total KYC applications
      // ---------------------------------------------------------
      prisma.kYCApplication.count(),

      // ---------------------------------------------------------
      // Active order enquiries
      // ---------------------------------------------------------
      prisma.orderEnquiry.count({
        where: {
          status: {
            notIn: [
              'COMPLETED',
              'CANCELLED',
            ],
          },
        },
      }),

      // ---------------------------------------------------------
      // Active products
      // ---------------------------------------------------------
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),

      // ---------------------------------------------------------
      // Low-stock products
      // ---------------------------------------------------------
      prisma.product.findMany({
        where: {
          isActive: true,
          availableSets: {
            lte: 8,
          },
        },

        orderBy: {
          availableSets: 'asc',
        },

        take: 10,

        select: {
          id: true,
          sku: true,
          designNumber: true,
          name: true,
          availableSets: true,
          totalAvailablePieces: true,
        },
      }),

      // ---------------------------------------------------------
      // Approved retailers
      // ---------------------------------------------------------
      prisma.retailerProfile.count({
        where: {
          status: 'APPROVED',
        },
      }),

      // ---------------------------------------------------------
      // Active vendors
      // ---------------------------------------------------------
      prisma.vendorProfile.count({
        where: {
          isActive: true,
        },
      }),

      // ---------------------------------------------------------
      // Recent KYC applications
      // ---------------------------------------------------------
      prisma.kYCApplication.findMany({
        orderBy: {
          submittedAt: 'desc',
        },

        take: 5,

        select: {
          id: true,
          businessName: true,
          applicantName: true,
          mobile: true,
          email: true,
          gstin: true,
          status: true,
          submittedAt: true,
        },
      }),

      // ---------------------------------------------------------
      // Recent orders
      // ---------------------------------------------------------
      prisma.orderEnquiry.findMany({
        orderBy: {
          createdAt: 'desc',
        },

        take: 5,

        select: {
          id: true,
          orderNumber: true,
          retailerBusinessName: true,
          retailerApplicantName: true,
          totalDesigns: true,
          totalSets: true,
          totalPieces: true,
          masterTotal: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // -----------------------------------------------------------
    // Get all active orders for pipeline calculations
    // -----------------------------------------------------------
    const pipelineOrders =
      await prisma.orderEnquiry.findMany({
        where: {
          status: {
            notIn: [
              'COMPLETED',
              'CANCELLED',
            ],
          },
        },

        select: {
          masterTotal: true,
          totalSets: true,
        },
      });

    const grossEnquiryPipeline =
      pipelineOrders.reduce(
        (total, order) =>
          total + Number(order.masterTotal),
        0
      );

    const totalSetsInPipeline =
      pipelineOrders.reduce(
        (total, order) =>
          total + order.totalSets,
        0
      );

    return {
      metrics: {
        pendingKyc,

        totalKycApplications:
          totalKyc,

        activeOrderEnquiries:
          activeOrders,

        grossEnquiryPipeline,

        totalSetsInPipeline,

        activeProducts,

        lowStockProducts:
          lowStockProducts.length,

        approvedRetailers,

        activeVendors,
      },

      pendingKyc:
        recentKyc.map((application) => ({
          id: application.id,

          businessName:
            application.businessName,

          applicantName:
            application.applicantName,

          mobile:
            application.mobile,

          email:
            application.email,

          gstin:
            application.gstin,

          status:
            application.status,

          submittedAt:
            application.submittedAt.toISOString(),
        })),

      recentOrders:
        recentOrders.map((order) => ({
          id: order.id,

          orderNumber:
            order.orderNumber,

          retailerBusinessName:
            order.retailerBusinessName,

          retailerApplicantName:
            order.retailerApplicantName,

          totalDesigns:
            order.totalDesigns,

          totalSets:
            order.totalSets,

          totalPieces:
            order.totalPieces,

          masterTotal:
            Number(order.masterTotal),

          status:
            order.status,

          createdAt:
            order.createdAt.toISOString(),
        })),

      lowStockProducts:
        lowStockProducts.map((product) => ({
          id: product.id,

          sku:
            product.sku,

          designNumber:
            product.designNumber,

          name:
            product.name,

          availableSets:
            product.availableSets,

          totalAvailablePieces:
            product.totalAvailablePieces,
        })),
    };
  }
}