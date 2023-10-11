import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postsRouter = createTRPCRouter({
  //anyone can get the posts.
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany();
  }),
});
