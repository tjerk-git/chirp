import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server";

import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


const filterUserForClient = (user: User) => {
  return { id: user.id, username: user.username, imageUrl: user.imageUrl }
}

export const postsRouter = createTRPCRouter({
  //anyone can get the posts.
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({ take: 100 });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.username)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author not found" });

      return {
        post,
        author: {
          ...author,
          username: author.username,
        }
      };
    });
  }),
});
