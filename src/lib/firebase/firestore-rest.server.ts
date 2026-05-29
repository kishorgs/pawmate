/**
 * Lightweight Firestore REST repository helpers.
 *
 * Firestore REST encodes documents as { fields: { name: { stringValue: "..." } } }.
 * We expose `encode`/`decode` to convert plain JS objects ↔ Firestore values,
 * and `getDoc/setDoc/updateDoc/deleteDoc/queryCollection` for CRUD.
 */
import { firestoreFetch, getFirebaseProjectId } from "./admin.server";

// -------- Value encoding --------

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { arrayValue: { values: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

export function encodeValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "string") {
    // Heuristic: ISO 8601 dates become timestamps.
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return { timestampValue: value };
    }
    return { stringValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeValue) } };
  }
  if (typeof value === "object") {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      fields[k] = encodeValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

export function encodeFields(obj: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    fields[k] = encodeValue(v);
  }
  return fields;
}

export function decodeValue(value: FirestoreValue | undefined): unknown {
  if (!value) return null;
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decodeValue);
  if ("mapValue" in value) return decodeFields(value.mapValue.fields ?? {});
  return null;
}

export function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields ?? {})) {
    result[k] = decodeValue(v);
  }
  return result;
}

// -------- Document/collection ops --------

export interface FirestoreDoc<T = Record<string, unknown>> {
  id: string;
  data: T;
  createTime?: string;
  updateTime?: string;
}

function parseDocResponse<T>(json: {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}): FirestoreDoc<T> {
  const name = json.name ?? "";
  const id = name.split("/").pop() ?? "";
  return {
    id,
    data: decodeFields(json.fields ?? {}) as T,
    createTime: json.createTime,
    updateTime: json.updateTime,
  };
}

export async function getDocument<T>(
  collection: string,
  docId: string,
): Promise<FirestoreDoc<T> | null> {
  const res = await firestoreFetch(`/${collection}/${encodeURIComponent(docId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getDocument(${collection}/${docId}): ${res.status} ${await res.text()}`);
  return parseDocResponse<T>(await res.json());
}

export async function setDocument<T extends Record<string, unknown>>(
  collection: string,
  docId: string,
  data: T,
): Promise<FirestoreDoc<T>> {
  const res = await firestoreFetch(
    `/${collection}/${encodeURIComponent(docId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ fields: encodeFields(data) }),
    },
  );
  if (!res.ok) throw new Error(`setDocument: ${res.status} ${await res.text()}`);
  return parseDocResponse<T>(await res.json());
}

export async function createDocument<T extends Record<string, unknown>>(
  collection: string,
  data: T,
  docId?: string,
): Promise<FirestoreDoc<T>> {
  const query = docId ? `?documentId=${encodeURIComponent(docId)}` : "";
  const res = await firestoreFetch(`/${collection}${query}`, {
    method: "POST",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
  if (!res.ok) throw new Error(`createDocument: ${res.status} ${await res.text()}`);
  return parseDocResponse<T>(await res.json());
}

export async function updateDocument<T extends Record<string, unknown>>(
  collection: string,
  docId: string,
  patch: Partial<T>,
): Promise<FirestoreDoc<T>> {
  const mask = Object.keys(patch)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  const res = await firestoreFetch(
    `/${collection}/${encodeURIComponent(docId)}?${mask}`,
    {
      method: "PATCH",
      body: JSON.stringify({ fields: encodeFields(patch as Record<string, unknown>) }),
    },
  );
  if (!res.ok) throw new Error(`updateDocument: ${res.status} ${await res.text()}`);
  return parseDocResponse<T>(await res.json());
}

export async function deleteDocument(collection: string, docId: string): Promise<void> {
  const res = await firestoreFetch(`/${collection}/${encodeURIComponent(docId)}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`deleteDocument: ${res.status} ${await res.text()}`);
  }
}

export interface WhereClause {
  field: string;
  op:
    | "EQUAL"
    | "NOT_EQUAL"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL"
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL"
    | "ARRAY_CONTAINS"
    | "IN";
  value: unknown;
}

export interface QueryOptions {
  where?: WhereClause[];
  orderBy?: { field: string; direction?: "ASCENDING" | "DESCENDING" }[];
  limit?: number;
}

export async function queryCollection<T>(
  collection: string,
  options: QueryOptions = {},
): Promise<FirestoreDoc<T>[]> {
  const filters = (options.where ?? []).map((w) => ({
    fieldFilter: {
      field: { fieldPath: w.field },
      op: w.op,
      value: encodeValue(w.value),
    },
  }));

  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where:
        filters.length === 0
          ? undefined
          : filters.length === 1
            ? filters[0]
            : { compositeFilter: { op: "AND", filters } },
      orderBy: options.orderBy?.map((o) => ({
        field: { fieldPath: o.field },
        direction: o.direction ?? "ASCENDING",
      })),
      limit: options.limit,
    },
  };

  const res = await firestoreFetch(`:runQuery`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`queryCollection: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as Array<{ document?: Parameters<typeof parseDocResponse>[0] }>;
  return rows
    .filter((r) => r.document)
    .map((r) => parseDocResponse<T>(r.document!));
}

// Re-export project id helper.
export { getFirebaseProjectId };
