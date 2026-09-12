export type SearchResultType = "youtube" | "news" | "paper";

export type SearchResult = {
    id: string;
    type: SearchResultType;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    publishedAt: string | null;
};