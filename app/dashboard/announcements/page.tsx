"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, ChevronDown } from "lucide-react";
import { postApi } from "@/lib/api/client";
import { Post } from "@/lib/types";
import { formatDate, truncate } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (skip = 0) => {
    try {
      const res = await postApi.list({ skip, limit: 10 });
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      if (skip === 0) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length >= 10);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setLoading(true);
    loadPosts(0).finally(() => setLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadPosts(posts.length);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="h-6 w-6 text-teal-600" />
          Announcements
        </h1>
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4 max-w-2xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Bell className="h-6 w-6 text-teal-600" />
        Announcements
      </h1>

      {posts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No announcements"
          description="There are no announcements or posts at this time."
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const isExpanded = expandedId === post.id;
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                  className="w-full text-left px-4 py-4"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusBadge status={post.post_type} />
                    <span className="text-[10px] text-gray-400">{formatDate(post.created_at)}</span>
                    {post.author_name && (
                      <span className="text-[10px] text-gray-400">by {post.author_name}</span>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{post.title}</h3>
                    <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                  {!isExpanded && post.content && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {truncate(post.content, 120)}
                    </p>
                  )}
                </button>
                {isExpanded && post.content && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-3 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all"
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Load more"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
