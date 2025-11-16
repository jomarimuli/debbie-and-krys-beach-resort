// resources/js/types/faq.ts

export interface FAQ {
    id: number;
    question: string;
    answer: string;
    keywords: string[] | null;
    is_active: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface FAQSearch {
    id: number;
    query: string;
    faq_id: number | null;
    was_helpful: boolean | null;
    created_at: string;
    updated_at: string;
    faq?: FAQ;
}

export interface FAQFormData {
    question: string;
    answer: string;
    keywords: string[];
    is_active: boolean;
    order: number;
}

export interface FAQIndexData {
    faqs: {
        data: FAQ[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface FAQSearchResult {
    faqs: FAQ[];
    search_id?: number;
}

export interface FAQAnalytics {
    total_searches: number;
    helpful_count: number;
    not_helpful_count: number;
    no_match_count: number;
    top_searches: {
        query: string;
        count: number;
    }[];
    unanswered_queries: {
        query: string;
        count: number;
    }[];
}
