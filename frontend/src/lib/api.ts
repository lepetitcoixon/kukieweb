interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details: any;
  };
}

interface StrapiDataItem<T> {
  id: number;
  attributes: T;
  meta?: Record<string, any>; // For any metadata Strapi might include
}

interface StrapiCollectionResponse<T> {
  data: StrapiDataItem<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse<T> {
  data: StrapiDataItem<T>;
  meta: Record<string, any>;
}

// Helper to get Strapi URL from environment variables
function getStrapiURL(path = ""): string {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
  return `${apiUrl}${path}`;
}

// Helper to get Strapi API token from environment variables
function getStrapiApiToken(): string | undefined {
  return process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || undefined;
}

/**
 * Fetches data from the Strapi API
 * @param path Path to the API endpoint (e.g., "/api/posts")
 * @param urlParamsObject URL parameters object (e.g., { populate: "*" })
 * @param options Additional fetch options
 * @returns Parsed JSON data from the API
 * @throws Error if the fetch operation fails
 */
export async function fetchApi<T>(
  path: string,
  urlParamsObject: Record<string, any> = {},
  options: RequestInit = {}
): Promise<T> {
  try {
    // Merge default options with user options
    const mergedOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(getStrapiApiToken() && { Authorization: `Bearer ${getStrapiApiToken()}` }),
      },
      ...options,
    };

    // Build request URL
    const queryString = new URLSearchParams(urlParamsObject).toString();
    const requestUrl = getStrapiURL(`/api${path}${queryString ? `?${queryString}` : ""}`);

    // console.log("Fetching from URL:", requestUrl); // For debugging

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions);

    // Handle response
    if (!response.ok) {
      const errorData: StrapiError = await response.json();
      console.error("Strapi API Error:", errorData.error);
      throw new Error(
        `Strapi API responded with status ${response.status}: ${errorData.error.message || "Unknown error"}`
      );
    }

    const data: T = await response.json();
    return data;

  } catch (error) {
    console.error("Error in fetchApi:", error);
    // Re-throw the error so components can handle it if needed
    if (error instanceof Error) {
      throw new Error(`API fetch failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred during API fetch.");
    }
  }
}

// Define interfaces for our content types based on Strapi schema
// These should match the attributes defined in Strapi

export interface PageAttributes {
  title: string;
  slug: string;
  contentBody: string; // Assuming richtext is a string (HTML or Markdown)
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PostAttributes {
  title: string;
  slug: string;
  excerpt?: string;
  contentBody: string; // Assuming richtext is a string
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Specific fetch functions for Posts

export async function getPosts(params: Record<string, any> = {}): Promise<StrapiCollectionResponse<PostAttributes>> {
  return fetchApi<StrapiCollectionResponse<PostAttributes>>("/posts", params);
}

export async function getPostBySlug(slug: string, params: Record<string, any> = {}): Promise<StrapiSingleResponse<PostAttributes> | null> {
  // Strapi typically filters by slug using field filtering: /api/posts?filters[slug][$eq]=my-slug
  const response = await fetchApi<StrapiCollectionResponse<PostAttributes>>("/posts", {
    ...params,
    'filters[slug][$eq]': slug,
  });
  if (response.data && response.data.length > 0) {
    // The response for a collection is an array, even if only one item is expected.
    // We need to wrap it into the StrapiSingleResponse structure.
    return { data: response.data[0], meta: response.meta };
  }
  return null;
}


// Specific fetch functions for Pages

export async function getPages(params: Record<string, any> = {}): Promise<StrapiCollectionResponse<PageAttributes>> {
  return fetchApi<StrapiCollectionResponse<PageAttributes>>("/pages", params);
}

export async function getPageBySlug(slug: string, params: Record<string, any> = {}): Promise<StrapiSingleResponse<PageAttributes> | null> {
  const response = await fetchApi<StrapiCollectionResponse<PageAttributes>>("/pages", {
    ...params,
    'filters[slug][$eq]': slug,
  });
   if (response.data && response.data.length > 0) {
    return { data: response.data[0], meta: response.meta };
  }
  return null;
}
