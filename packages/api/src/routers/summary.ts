import {
  categories,
  houses,
  invoices,
  payments,
  payoutDestinations,
  paystackCharges,
  paystackPayouts,
  properties,
  renters,
} from "@havenly/db";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { adminProcedure, router } from "../index";

export const summaryRouter = router({
  rentalSummary: adminProcedure.query(async ({ ctx }) => {
    const { id: organizationId } = ctx.orgId;

    if (!organizationId) {
      throw new TRPCError({
        message: "No active organization",
        code: "BAD_REQUEST",
      });
    }

    const rows = await ctx.db
      .select({
        propertyId: properties.id,
        propertyName: properties.name,
        propertyAddress: properties.address,
        propertyCity: properties.city,
        propertyState: properties.state,
        propertyType: properties.propertyType,
        propertyCreatedAt: properties.createdAt,

        houseId: houses.id,
        unitNumber: houses.unitNumber,
        bedrooms: houses.bedrooms,
        bathrooms: houses.bathrooms,
        sizeSqft: houses.sizeSqft,
        monthlyRent: houses.monthlyRent,
        houseStatus: houses.status,
        houseCreatedAt: houses.createdAt,

        categoryId: categories.id,
        categoryTitle: categories.title,
        categoryFeatures: categories.features,
        categoryDescription: categories.description,
        categoryOtherFeatures: categories.otherFeatures,

        renterId: renters.id,
        renterName: renters.name,
        renterEmail: renters.email,
        renterPhone: renters.phone,
        leaseStart: renters.leaseStart,
        leaseEnd: renters.leaseEnd,
        paystackCustomerCode: renters.paystackCustomerCode,
        paystackCustomerId: renters.paystackCustomerId,

        paymentId: payments.id,
        paymentAmount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentPeriod: payments.period,
        paymentMethod: payments.method,
        paymentStatus: payments.status,

        organizationId: properties.organizationId,
      })
      .from(properties)
      .leftJoin(houses, eq(houses.propertyId, properties.id))
      .leftJoin(categories, eq(categories.id, houses.categoryId))
      .leftJoin(renters, eq(renters.houseId, houses.id))
      .leftJoin(payments, eq(payments.houseId, houses.id))
      .where(eq(properties.organizationId, organizationId))
      .orderBy(desc(properties.createdAt));

    const propertyMap = new Map<string, (typeof rows)[number]>();
    const houseMap = new Map<string, (typeof rows)[number]>();
    const renterMap = new Map<string, (typeof rows)[number]>();
    const paymentMap = new Map<string, (typeof rows)[number]>();
    const categoryMap = new Map<string, (typeof rows)[number]>();

    for (const row of rows) {
      if (row.propertyId && !propertyMap.has(row.propertyId)) {
        propertyMap.set(row.propertyId, row);
      }
      if (row.houseId && !houseMap.has(row.houseId)) {
        houseMap.set(row.houseId, row);
      }
      if (row.categoryId && !categoryMap.has(row.categoryId)) {
        categoryMap.set(row.categoryId, row);
      }
      if (row.renterId && !renterMap.has(row.renterId)) {
        renterMap.set(row.renterId, row);
      }
      if (row.paymentId && !paymentMap.has(row.paymentId)) {
        paymentMap.set(row.paymentId, row);
      }
    }

    return {
      properties: [...propertyMap.values()].map((r) => ({
        id: r.propertyId!,
        organizationId: r.organizationId!,
        name: r.propertyName!,
        address: r.propertyAddress!,
        city: r.propertyCity!,
        state: r.propertyState!,
        propertyType: r.propertyType!,
        createdAt: r.propertyCreatedAt!,
      })),
      houses: [...houseMap.values()].map((r) => ({
        id: r.houseId!,
        organizationId: r.organizationId!,
        propertyId: r.propertyId!,
        categoryId: r.categoryId,
        unitNumber: r.unitNumber!,
        bedrooms: r.bedrooms!,
        bathrooms: r.bathrooms!,
        sizeSqft: r.sizeSqft!,
        monthlyRent: r.monthlyRent!,
        status: r.houseStatus!,
        createdAt: r.houseCreatedAt!,
      })),
      categories: [...categoryMap.values()].map((r) => ({
        id: r.categoryId!,
        organizationId: r.organizationId!,
        title: r.categoryTitle!,
        features: r.categoryFeatures ?? [],
        description: r.categoryDescription ?? "",
        otherFeatures: (r.categoryOtherFeatures ?? {}) as Record<
          string,
          unknown
        >,
        createdAt: new Date(),
      })),
      renters: [...renterMap.values()].map((r) => ({
        id: r.renterId!,
        organizationId: r.organizationId!,
        houseId: r.houseId!,
        name: r.renterName!,
        email: r.renterEmail,
        phone: r.renterPhone,
        leaseStart: r.leaseStart ? new Date(r.leaseStart) : null,
        leaseEnd: r.leaseEnd ? new Date(r.leaseEnd) : null,
        paystackCustomerCode: r.paystackCustomerCode,
        paystackCustomerId: r.paystackCustomerId,
        createdAt: new Date(),
      })),
      payments: [...paymentMap.values()].map((r) => ({
        id: r.paymentId!,
        organizationId: r.organizationId!,
        houseId: r.houseId!,
        renterId: r.renterId ?? null,
        amount: r.paymentAmount!,
        paymentDate: new Date(r.paymentDate!),
        period: r.paymentPeriod!,
        method: r.paymentMethod!,
        status: r.paymentStatus!,
        createdAt: new Date(),
      })),
    };
  }),

  paymentsView: adminProcedure.query(async ({ ctx }) => {
    const { id: organizationId } = ctx.orgId;

    if (!organizationId) {
      throw new TRPCError({
        message: "No active organization",
        code: "BAD_REQUEST",
      });
    }

    const rows = await ctx.db
      .select({
        invoiceId: invoices.id,
        invoiceOrganizationId: invoices.organizationId,
        invoiceAmount: invoices.amount,
        invoiceCurrency: invoices.currency,
        invoicePeriod: invoices.period,
        invoiceDueDate: invoices.dueDate,
        invoiceStatus: invoices.status,
        invoicePaidAt: invoices.paidAt,
        invoiceCreatedAt: invoices.createdAt,

        houseId: houses.id,
        unitNumber: houses.unitNumber,
        bedrooms: houses.bedrooms,
        bathrooms: houses.bathrooms,
        monthlyRent: houses.monthlyRent,
        houseStatus: houses.status,

        renterId: renters.id,
        renterName: renters.name,
        renterEmail: renters.email,
        renterPhone: renters.phone,

        chargeId: paystackCharges.id,
        chargeReference: paystackCharges.reference,
        chargePaystackId: paystackCharges.paystackId,
        chargeAmount: paystackCharges.amount,
        chargeChannel: paystackCharges.channel,
        chargeStatus: paystackCharges.status,
        chargeCreatedAt: paystackCharges.createdAt,

        payoutId: paystackPayouts.id,
        payoutDestinationId: paystackPayouts.destinationId,
        payoutReference: paystackPayouts.reference,
        payoutPaystackTransferCode: paystackPayouts.paystackTransferCode,
        payoutPaystackId: paystackPayouts.paystackId,
        payoutAmount: paystackPayouts.amount,
        payoutCurrency: paystackPayouts.currency,
        payoutNarration: paystackPayouts.narration,
        payoutStatus: paystackPayouts.status,
        payoutCreatedAt: paystackPayouts.createdAt,
        payoutUpdatedAt: paystackPayouts.updatedAt,

        destinationId: payoutDestinations.id,
        destinationType: payoutDestinations.type,
        destinationPhone: payoutDestinations.phone,
        destinationBankName: payoutDestinations.bankName,
        destinationAccountNumber: payoutDestinations.accountNumber,
        destinationIsDefault: payoutDestinations.isDefault,
      })
      .from(invoices)
      .leftJoin(houses, eq(houses.id, invoices.houseId))
      .leftJoin(renters, eq(renters.id, invoices.renterId))
      .leftJoin(paystackCharges, eq(paystackCharges.invoiceId, invoices.id))
      .leftJoin(paystackPayouts, eq(paystackPayouts.invoiceId, invoices.id))
      .leftJoin(
        payoutDestinations,
        and(
          eq(payoutDestinations.organizationId, invoices.organizationId),
          eq(payoutDestinations.isDefault, true),
        ),
      )
      .where(eq(invoices.organizationId, organizationId))
      .orderBy(desc(invoices.createdAt));

    const invoiceMap = new Map<string, (typeof rows)[number]>();
    const chargeMap = new Map<string, (typeof rows)[number]>();
    const houseMap = new Map<string, (typeof rows)[number]>();
    const renterMap = new Map<string, (typeof rows)[number]>();
    const payoutMap = new Map<string, (typeof rows)[number]>();

    for (const row of rows) {
      if (row.invoiceId && !invoiceMap.has(row.invoiceId)) {
        invoiceMap.set(row.invoiceId, row);
      }
      if (row.chargeId && !chargeMap.has(row.chargeId)) {
        chargeMap.set(row.chargeId, row);
      }
      if (row.houseId && !houseMap.has(row.houseId)) {
        houseMap.set(row.houseId, row);
      }
      if (row.renterId && !renterMap.has(row.renterId)) {
        renterMap.set(row.renterId, row);
      }
      if (row.payoutId && !payoutMap.has(row.payoutId)) {
        payoutMap.set(row.payoutId, row);
      }
    }

    return {
      houses: [...houseMap.values()].map((r) => ({
        id: r.houseId!,
        organizationId: organizationId,
        unitNumber: r.unitNumber!,
        bedrooms: r.bedrooms!,
        bathrooms: r.bathrooms!,
        monthlyRent: r.monthlyRent!,
        status: r.houseStatus!,
        createdAt: new Date(),
      })),
      renters: [...renterMap.values()].map((r) => ({
        id: r.renterId!,
        organizationId: organizationId,
        houseId: r.houseId!,
        name: r.renterName!,
        email: r.renterEmail,
        phone: r.renterPhone,
        createdAt: new Date(),
      })),
      invoices: [...invoiceMap.values()].map((r) => ({
        id: r.invoiceId!,
        organizationId: r.invoiceOrganizationId!,
        houseId: r.houseId!,
        renterId: r.renterId,
        amount: r.invoiceAmount!,
        currency: r.invoiceCurrency!,
        period: r.invoicePeriod!,
        dueDate: r.invoiceDueDate!,
        status: r.invoiceStatus!,
        paidAt: r.invoicePaidAt,
        createdAt: r.invoiceCreatedAt!,
      })),
      charges: [...chargeMap.values()].map((r) => ({
        id: r.chargeId!,
        organizationId: organizationId,
        invoiceId: r.invoiceId!,
        reference: r.chargeReference!,
        paystackId: r.chargePaystackId,
        amount: r.chargeAmount!,
        currency: "KES",
        channel: r.chargeChannel!,
        status: r.chargeStatus!,
        createdAt: r.chargeCreatedAt!,
        updatedAt: r.chargeCreatedAt!,
      })),
      destinations: (() => {
        const dest = rows.find((r) => r.destinationId != null);
        if (!dest || !dest.destinationId) return [];
        return [
          {
            id: dest.destinationId,
            organizationId: organizationId,
            type: dest.destinationType!,
            phone: dest.destinationPhone,
            bankName: dest.destinationBankName,
            accountNumber: dest.destinationAccountNumber,
            isDefault: dest.destinationIsDefault,
            createdAt: new Date(),
          },
        ];
      })(),
      payouts: [...payoutMap.values()].map((r) => ({
        id: r.payoutId!,
        organizationId: organizationId,
        destinationId: r.payoutDestinationId!,
        invoiceId: r.invoiceId,
        reference: r.payoutReference!,
        paystackTransferCode: r.payoutPaystackTransferCode,
        paystackId: r.payoutPaystackId,
        amount: r.payoutAmount!,
        currency: r.payoutCurrency!,
        narration: r.payoutNarration,
        status: r.payoutStatus!,
        createdAt: r.payoutCreatedAt!,
        updatedAt: r.payoutUpdatedAt!,
      })),
    };
  }),
});
