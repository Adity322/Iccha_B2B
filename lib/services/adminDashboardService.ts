import { prisma } from "@/lib/db";

const ACTIVE_ORDER_STATUSES = [
  "ENQUIRY_RECEIVED",
  "UNDER_REVIEW",
  "SELLER_CONTACTED",
  "ESTIMATE_GENERATED",
  "CONFIRMED",
  "AWAITING_PAYMENT",
  "PROCESSING",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
] as const;

export class AdminDashboardService {
  static async getDashboard() {
    const [
      pendingKycCount,
      totalKycCount,

      activeOrdersCount,
      activeOrders,

      activeProductsCount,
      lowStockProducts,

      approvedRetailersCount,
      activeVendorsCount,

      publishedHeroCount,
      scheduledHeroCount,

      recentKyc,
      recentOrders,
    ] = await Promise.all([
      /**
       * KYC
       */
      prisma.kYCApplication.count({
        where: {
          status: {
            in: [
              "APPLICATION_RECEIVED",
              "UNDER_REVIEW",
              "ADDITIONAL_INFORMATION_REQUIRED",
            ],
          },
        },
      }),

      prisma.kYCApplication.count(),

      /**
       * Active orders
       */
      prisma.orderEnquiry.count({
        where: {
          status: {
            in: ACTIVE_ORDER_STATUSES as any,
          },
        },
      }),

      prisma.orderEnquiry.findMany({
        where: {
          status: {
            in: ACTIVE_ORDER_STATUSES as any,
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 100,

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

      /**
       * Products
       */
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),

      prisma.product.findMany({
        where: {
          isActive: true,
          availableSets: {
            lte: 8,
          },
        },

        orderBy: {
          availableSets: "asc",
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

      /**
       * Retailers
       */
      prisma.retailerProfile.count({
        where: {
          status: "APPROVED",
        },
      }),

      /**
       * Vendors
       */
      prisma.vendorProfile.count({
        where: {
          isActive: true,
        },
      }),

      /**
       * Hero
       */
      prisma.heroSlide.count({
        where: {
          status: "PUBLISHED",
        },
      }),

      prisma.heroSlide.count({
        where: {
          status: "SCHEDULED",
        },
      }),

      /**
       * Recent KYC
       */
      prisma.kYCApplication.findMany({
        orderBy: {
          submittedAt: "desc",
        },

        take: 5,

        select: {
          id: true,
          businessName: true,
          applicantName: true,
          mobile: true,
          gstin: true,
          status: true,
          submittedAt: true,
        },
      }),

      /**
       * Recent orders
       */
      prisma.orderEnquiry.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        select: {
          id: true,
          orderNumber: true,
          retailerBusinessName: true,
          retailerApplicantName: true,
          totalSets: true,
          totalPieces: true,
          masterTotal: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const totalWholesalePipeline =
      activeOrders.reduce(
        (total, order) =>
          total + Number(order.masterTotal),
        0
      );

    const totalSetsInPipeline =
      activeOrders.reduce(
        (total, order) =>
          total + order.totalSets,
        0
      );

    return {
      metrics: {
        pendingKyc: pendingKycCount,

        totalKycApplications:
          totalKycCount,

        activeOrderEnquiries:
          activeOrdersCount,

        wholesalePipeline:
          totalWholesalePipeline,

        setsInPipeline:
          totalSetsInPipeline,

        activeProducts:
          activeProductsCount,

        lowStockProducts:
          lowStockProducts.length,

        approvedRetailers:
          approvedRetailersCount,

        activeVendors:
          activeVendorsCount,

        publishedHeroSlides:
          publishedHeroCount,

        scheduledHeroSlides:
          scheduledHeroCount,
      },

      kyc: recentKyc.map(
        (application) => ({
          id: application.id,

          businessName:
            application.businessName,

          applicantName:
            application.applicantName,

          mobile:
            application.mobile,

          gstin:
            application.gstin,

          status:
            application.status,

          submittedAt:
            application.submittedAt.toISOString(),
        })
      ),

      orders: recentOrders.map(
        (order) => ({
          id: order.id,

          orderNumber:
            order.orderNumber,

          retailerBusinessName:
            order.retailerBusinessName,

          retailerApplicantName:
            order.retailerApplicantName,

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
        })
      ),

      lowStock: lowStockProducts.map(
        (product) => ({
          id: product.id,

          sku: product.sku,

          designNumber:
            product.designNumber,

          name: product.name,

          availableSets:
            product.availableSets,

          totalAvailablePieces:
            product.totalAvailablePieces,
        })
      ),
    };
  }
}