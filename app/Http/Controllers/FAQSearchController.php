<?php

namespace App\Http\Controllers;

use App\Models\FAQ;
use App\Models\FAQSearch;
use App\Http\Requests\FAQ\SearchFAQRequest;
use Illuminate\Http\Request;

class FAQSearchController extends Controller
{
    public function popularQuestions()
    {
        $faqs = FAQ::active()
            ->ordered()
            ->limit(20)
            ->get();

        return response()->json([
            'faqs' => $faqs,
        ]);
    }

    public function search(SearchFAQRequest $request)
    {
        $query = $request->validated()['query'];

        $faqs = FAQ::search($query);

        $searchLog = FAQSearch::create([
            'query' => $query,
            'faq_id' => $faqs->first()?->id,
        ]);

        return response()->json([
            'faqs' => $faqs,
            'search_id' => $searchLog->id,
        ]);
    }

    public function feedback(Request $request, FAQSearch $faqSearch)
    {
        $request->validate([
            'was_helpful' => ['required', 'boolean'],
        ]);

        $faqSearch->update([
            'was_helpful' => $request->was_helpful,
        ]);

        return response()->json(['success' => true]);
    }

    public function analytics()
    {
        if (!auth()->user()->can('faq show') && !auth()->user()->can('global access')) {
            abort(403);
        }

        $totalSearches = FAQSearch::count();
        $helpfulCount = FAQSearch::where('was_helpful', true)->count();
        $notHelpfulCount = FAQSearch::where('was_helpful', false)->count();
        $noMatchCount = FAQSearch::whereNull('faq_id')->count();

        $topSearches = FAQSearch::selectRaw('query, COUNT(*) as count')
            ->groupBy('query')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $unansweredQueries = FAQSearch::whereNull('faq_id')
            ->selectRaw('query, COUNT(*) as count')
            ->groupBy('query')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        return response()->json([
            'total_searches' => $totalSearches,
            'helpful_count' => $helpfulCount,
            'not_helpful_count' => $notHelpfulCount,
            'no_match_count' => $noMatchCount,
            'top_searches' => $topSearches,
            'unanswered_queries' => $unansweredQueries,
        ]);
    }
}
