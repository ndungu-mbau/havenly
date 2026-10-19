import { protectedProcedure, publicProcedure, router } from "../index";
import { caretakersRouter } from "./caretakers";
import { categoriesRouter } from "./categories";
import { chargesRouter } from "./charges";
import { housesRouter } from "./houses";
import { invoicesRouter } from "./invoices";
import { messagesRouter } from "./messages";
import { paymentsRouter } from "./payments";
import { payoutsRouter } from "./payouts";
import { propertiesRouter } from "./properties";
import { rentersRouter } from "./renters";
import { summaryRouter } from "./summary";
import { utilitiesRouter } from "./utilities";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),

  summary: summaryRouter,
  properties: propertiesRouter,
  houses: housesRouter,
  categories: categoriesRouter,
  renters: rentersRouter,
  caretakers: caretakersRouter,
  invoices: invoicesRouter,
  payments: paymentsRouter,
  payouts: payoutsRouter,
  charges: chargesRouter,
  utilities: utilitiesRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
