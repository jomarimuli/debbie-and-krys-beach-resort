<?php

namespace App\Http\Controllers;

use App\Models\FAQ;
use App\Http\Requests\FAQ\StoreFAQRequest;
use App\Http\Requests\FAQ\UpdateFAQRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FAQController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('faq show') && !auth()->user()->can('global access')) {
            abort(403);
        }

        $faqs = FAQ::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('question', 'like', "%{$search}%")
                        ->orWhere('answer', 'like', "%{$search}%");
                });
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->is_active);
            })
            ->ordered()
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        return Inertia::render('faq/index', [
            'faqs' => $faqs,
        ]);
    }

    public function store(StoreFAQRequest $request)
    {
        FAQ::create($request->validated());

        return redirect()->route('faqs.index')
            ->with('success', 'FAQ created successfully');
    }

    public function update(UpdateFAQRequest $request, FAQ $faq)
    {
        $faq->update($request->validated());

        return redirect()->route('faqs.index')
            ->with('success', 'FAQ updated successfully');
    }

    public function destroy(FAQ $faq)
    {
        if (!auth()->user()->can('faq delete') && !auth()->user()->can('global access')) {
            abort(403);
        }

        $faq->delete();

        return redirect()->route('faqs.index')
            ->with('success', 'FAQ deleted successfully');
    }
}
