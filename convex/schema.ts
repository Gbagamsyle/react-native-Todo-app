import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  todos: defineTable({
    title: v.string(),
    description: v.string(),
    completed: v.boolean(),
    dueDate: v.optional(v.number()),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_created_at', ['createdAt'])
    .index('by_updated_at', ['updatedAt']),
});