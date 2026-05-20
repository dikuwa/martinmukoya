import { NextResponse } from "next/server";
import { z } from "zod";

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  published: z.coerce.boolean().optional(),
  includeUnpublished: z.coerce.boolean().default(false),
  featured: z.coerce.boolean().optional(),
  status: z.string().trim().optional(),
  serviceType: z.string().trim().optional(),
  category: z.string().trim().optional(),
  source: z.string().trim().optional(),
  site: z.string().trim().optional(),
  siteId: z.string().trim().optional()
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export function parseListQuery(request: Request) {
  const url = new URL(request.url);
  return listQuerySchema.parse(Object.fromEntries(url.searchParams));
}

export function getPagination(query: ListQuery) {
  return {
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize
  };
}

export function paginated<T>(items: T[], total: number, query: ListQuery) {
  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      pageCount: Math.ceil(total / query.pageSize)
    }
  };
}

export function cacheKey(tag: string, request: Request) {
  const url = new URL(request.url);
  return `tag:${tag}:${url.pathname}:${url.searchParams.toString()}`;
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function notFound(message = "Record not found") {
  return ok({ error: message }, { status: 404 });
}

export function validationError(error: z.ZodError) {
  return ok(
    {
      error: "Validation failed",
      issues: error.issues
    },
    { status: 400 }
  );
}

export function serverError(error: unknown) {
  console.error(error);
  return ok({ error: "Something went wrong" }, { status: 500 });
}

export async function parseJson<TSchema extends z.ZodTypeAny>(request: Request, schema: TSchema): Promise<z.infer<TSchema>> {
  const body = await request.json();
  return schema.parse(body);
}

export function sortOrder(query: ListQuery, allowed: readonly string[], fallback = "createdAt") {
  const sortBy = query.sortBy && allowed.includes(query.sortBy) ? query.sortBy : fallback;
  return { [sortBy]: query.sortOrder };
}
