import AdminNav from "@/components/AdminNav";
import PostEditor from "@/components/PostEditor";

export default function NewPostPage() {
  return (
    <div>
      <AdminNav backHref="/admin" />
      <PostEditor />
    </div>
  );
}
