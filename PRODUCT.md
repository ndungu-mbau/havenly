# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Professional Property Managers. Their primary goal is to manage rental portfolios at scale, focusing on high-trust reporting, efficient renter communication, and the total elimination of manual rent collection efforts.

## Product Purpose

A rental management platform that automates the end-to-end rent collection lifecycle—from generating invoices to disbursing funds—so managers can stop "chasing rent" and focus on portfolio growth.

## Positioning

"Zero-effort rent collection." The product differentiates itself through a deep, automated integration with Paystack, specifically tailored for the East African market (KES, M-Pesa), turning rent collection from a manual chore into a passive background process.

## Operating Context

High-intensity administrative environments. Users operate from professional dashboards on desktop/laptop, requiring exceptional scanability, reliability, and "enterprise-lite" trust signals. Tenants interact via mobile-first payment flows.

## Capabilities and Constraints

- **Portfolio Management**: Multi-level hierarchy of properties and units (houses) with category-based templating for features and descriptions.
- **Automated Financials**: Automated invoice generation per period, linked to Paystack charges for real-time tracking.
- **Fund Disbursement**: Managed payout destinations (Bank/M-Pesa) via Paystack Transfers API.
- **Renter Lifecycle**: Renter management with direct linkage to Paystack customer codes for seamless recurring payments.
- **Role-Based Access**: Strict RBAC separating admin/manager functions from tenant views.
- **Technical Stack**: Next.js 16 (App Router), PostgreSQL, Drizzle ORM, better-auth, and Paystack API.

## Brand Commitments

- **Identity**: Modern Professional.
- **Aesthetic**: Sleek, high-trust, "enterprise-lite." The design must convey stability, precision, and efficiency.
- **Voice**: Authoritative yet enabling; focused on reliability and automation.

## Evidence on Hand

- **Core Schema**: Fully defined Drizzle schema covering properties, houses, renters, invoices, charges, and payouts.
- **Payment Integration**: Active implementation of Paystack charge and payout logic.
- **Auth System**: Integrated `better-auth` for role-based access.

## Product Principles

1. **Passive Collection**: Every feature should move the product closer to a state where rent is collected without human intervention.
2. **High-Trust Precision**: Financial data must be presented with absolute clarity and zero ambiguity to maintain professional trust.
3. **Scale-First Administration**: The interface must remain performant and scanable whether managing 10 units or 1,000.
4. **Frictionless Payouts**: Disbursing funds should be as automated and transparent as collecting them.
