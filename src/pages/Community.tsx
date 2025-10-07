import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Heart, Image as ImageIcon, Pin } from "lucide-react";
import {
  listPosts,
  createPost,
  listComments,
  createComment,
  listReactions,
  toggleReaction,
  getUser,
} from "@/lib/mock/api-extended";
import type { Post, Comment, Reaction, User } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDistanceToNow } from "date-fns";

export default function Community() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [postComments, setPostComments] = useState<Map<string, Comment[]>>(new Map());
  const [postReactions, setPostReactions] = useState<Map<string, Reaction[]>>(new Map());
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const allPosts = await listPosts();
    setPosts(allPosts);
    
    // Load users
    const userIds = new Set(allPosts.map(p => p.authorId));
    const userMap = new Map<string, User>();
    for (const id of userIds) {
      const u = await getUser(id);
      if (u) userMap.set(id, u);
    }
    setUsers(userMap);
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;
    
    const isPrivileged = user.role === 'owner' || user.role === 'trainer' || user.role === 'gym_admin';
    if (!user.isMember && !isPrivileged) {
      toast({
        title: "Membership required",
        description: "You need to be a member to post in the community.",
        variant: "destructive",
      });
      return;
    }

    await createPost({
      type: (isAnnouncement && user.role === 'owner') ? 'announcement' : 'thread',
      authorId: user.id,
      content: newPostContent,
      imageUrl: newPostImage || undefined,
    });
    
    setNewPostContent("");
    setNewPostImage("");
    setIsAnnouncement(false);
    setShowComposer(false);
    loadPosts();
    
    toast({
      title: "Posted!",
      description: "Your post has been shared with the community.",
    });
  };

  const loadPostComments = async (postId: string) => {
    const comments = await listComments(postId);
    setPostComments(prev => new Map(prev).set(postId, comments));
    
    // Load comment authors
    const userIds = new Set(comments.map(c => c.authorId));
    const userMap = new Map(users);
    for (const id of userIds) {
      if (!userMap.has(id)) {
        const u = await getUser(id);
        if (u) userMap.set(id, u);
      }
    }
    setUsers(userMap);
  };

  const loadPostReactions = async (postId: string) => {
    const reactions = await listReactions(postId);
    setPostReactions(prev => new Map(prev).set(postId, reactions));
  };

  const togglePostExpansion = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!postComments.has(postId)) loadPostComments(postId);
      if (!postReactions.has(postId)) loadPostReactions(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const handleReaction = async (postId: string) => {
    if (!user) return;
    await toggleReaction({ postId, userId: user.id, emoji: '❤️' });
    loadPostReactions(postId);
  };

  const handleComment = async (postId: string, content: string) => {
    if (!user || !content.trim()) return;
    await createComment({ postId, authorId: user.id, content });
    loadPostComments(postId);
  };

  const canPost = user && (user.isMember || user.role === 'owner' || user.role === 'trainer' || user.role === 'gym_admin');

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">Connect with fellow members</p>
        </div>
        {canPost && (
          <Dialog open={showComposer} onOpenChange={setShowComposer}>
            <DialogTrigger asChild>
              <Button>New Post</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <Input
                  placeholder="Image URL (optional)"
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                />
                {user?.role === 'owner' && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isAnnouncement}
                      onChange={(e) => setIsAnnouncement(e.target.checked)}
                      className="rounded"
                    />
                    Post as announcement
                  </label>
                )}
                <Button onClick={handleCreatePost} className="w-full">
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canPost && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Membership required for posting. You can read posts but need to be a member to participate.
          </p>
        </Card>
      )}

      {posts.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title="No posts yet"
          description="Be the first to start a conversation!"
        />
      )}

      <div className="space-y-4">
        {posts.map(post => {
          const author = users.get(post.authorId);
          const comments = postComments.get(post.id) || [];
          const reactions = postReactions.get(post.id) || [];
          const isExpanded = expandedPosts.has(post.id);
          const userReacted = reactions.some(r => r.userId === user?.id);

          return (
            <Card key={post.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={author?.avatarUrl} />
                    <AvatarFallback>{author?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{author?.name}</span>
                      {post.type === 'announcement' && (
                        <Badge variant="secondary" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Announcement
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt="Post image" 
                    className="rounded-lg max-h-96 object-cover w-full"
                  />
                )}

                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(post.id)}
                    className={userReacted ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${userReacted ? 'fill-current' : ''}`} />
                    {reactions.length > 0 && reactions.length}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePostExpansion(post.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {comments.length > 0 && comments.length}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t">
                    {comments.map(comment => {
                      const commentAuthor = users.get(comment.authorId);
                      return (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={commentAuthor?.avatarUrl} />
                            <AvatarFallback>
                              {commentAuthor?.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted rounded-lg p-3">
                            <p className="text-sm font-medium">{commentAuthor?.name}</p>
                            <p className="text-sm text-foreground">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {canPost && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
