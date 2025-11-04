// Remove all completed todos
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
export const clearCompleted = mutation({
  handler: async (ctx) => {
    const completed = await ctx.db
      .query('todos')
      .filter((q) => q.eq(q.field('completed'), true))
      .collect();
    await Promise.all(completed.map((todo) => ctx.db.delete(todo._id)));
  },
});

// Get all todos ordered by their creation time
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('todos')
      .withIndex('by_created_at')
      .collect();
  },
});

// Get a single todo by ID
export const get = query({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new todo
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const todos = await ctx.db
      .query('todos')
      .withIndex('by_created_at')
      .order('desc')
      .take(1);
    const maxOrder = todos.length > 0 ? todos[0].order : 0;
    
    const now = Date.now();
    return await ctx.db.insert('todos', {
      title: args.title,
      description: args.description,
      completed: false,
      dueDate: args.dueDate,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a todo
export const update = mutation({
  args: {
    id: v.id('todos'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a todo
export const remove = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Update todo order
export const updateOrder = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id('todos'),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { items } = args;
    await Promise.all(
      items.map((item) =>
        ctx.db.patch(item.id, {
          order: item.order,
          updatedAt: Date.now(),
        })
      )
    );
  },
});

// Search todos
export const search = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const { searchTerm } = args;
    const todos = await ctx.db.query('todos').collect();
    return todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
});