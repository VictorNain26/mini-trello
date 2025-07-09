import { z } from 'zod';

// Board validation schemas
export const CreateBoardSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
});

export const UpdateBoardSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
});

// Column validation schemas
export const CreateColumnSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
});

export const UpdateColumnSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
});

export const MoveColumnSchema = z.object({
  order: z.number().int().min(0),
});

// Card validation schemas
export const CreateCardSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
});

export const UpdateCardSchema = z
  .object({
    title: z.string().min(1, 'Title cannot be empty').trim().optional(),
    description: z.string().optional(),
    labels: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  })
  .refine(
    (data) => {
      // Validate due date is not in the past
      if (data.dueDate) {
        const selectedDate = new Date(data.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }
      return true;
    },
    {
      message: 'Due date cannot be in the past',
      path: ['dueDate'],
    }
  );

export const MoveCardSchema = z.object({
  columnId: z.string().uuid(),
  order: z.number().int().min(0),
});

// Invitation validation schemas
export const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  role: z.enum(['editor', 'reader']).default('reader'),
});

// Signup validation schema
export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

/**
 * Validate request body against schema
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message).join(', ');
    throw new Error(`Validation error: ${errors}`);
  }
  return result.data;
}
