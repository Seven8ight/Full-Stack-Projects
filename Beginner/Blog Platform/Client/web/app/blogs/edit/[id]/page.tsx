"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/_Components/Navbar";
import { Save, Eye, ChevronLeft, Loader2 } from "lucide-react";

const EditBlog = () => {
  const { id } = useParams();
  const router = useRouter();
  const ejInstance = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");

  // 1. Fetch existing data on mount
  useEffect(() => {
    const fetchExistingPost = async () => {
      try {
        // Replace with your actual Express endpoint
        const response = await fetch(`http://localhost:5000/api/blogs/${id}`);
        const data = await response.json();

        setTitle(data.title);
        initEditor(data.content); // Pass the saved JSON blocks here
        setLoading(false);
      } catch (error) {
        console.error("Failed to load blog:", error);
        setLoading(false);
      }
    };

    // if (id) fetchExistingPost();

    return () => {
      ejInstance.current?.destroy();
      ejInstance.current = null;
    };
  }, [id]);

  const initEditor = async (initialData: any) => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const List = (await import("@editorjs/list")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    const editor = new EditorJS({
      holder: "editorjs",
      placeholder: "Continue your narrative...",
      tools: {
        header: Header as any,
        list: List as any,
        image: {
          class: ImageTool,
          config: {
            endpoints: { byFile: "http://localhost:5000/api/upload/image" },
          },
        },
      },
      // PRIORITY: Load the data from the database
      data: initialData || { blocks: [] },
    });

    ejInstance.current = editor;
  };

  const handleUpdate = async () => {
    if (ejInstance.current) {
      setIsSaving(true);
      try {
        const outputData = await ejInstance.current.save();
        const updatedPayload = {
          title,
          content: outputData,
        };

        await fetch(`http://localhost:5000/api/blogs/${id}`, {
          method: "PATCH", // or PUT
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPayload),
        });

        router.push(`/blog/${id}`); // Redirect to view the changes
      } catch (error) {
        console.error("Update failed:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-studio-accent" size={40} />
      </div>
    );

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar />

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl">
        <div
          className="
    bg-background/70 dark:bg-surface/70
    backdrop-blur-xl
    border border-black/5 dark:border-white/10
    p-2 rounded-full
    flex items-center justify-between
    shadow-xl dark:shadow-none
  "
        >
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="p-3 text-foreground/60 hover:text-studio-green transition-colors ml-2"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-2">
            {/* Preview */}
            <button className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-studio-green transition-colors">
              <Eye size={16} /> Preview
            </button>

            {/* Save */}
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="
        flex items-center gap-2 
        bg-studio-green text-background 
        px-8 py-3 rounded-full 
        text-[10px] font-black uppercase tracking-widest
        hover:bg-studio-accent 
        transition-all
        disabled:opacity-50
      "
            >
              <Save size={16} /> {isSaving ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <section className="pt-32 pb-40 px-6 max-w-4xl mx-auto">
        <span className="text-studio-accent font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
          Editing Archive Entry
        </span>

        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-5xl md:text-7xl font-serif italic text-studio-green outline-none placeholder:text-gray-100 dark:placeholder:text-white/5 resize-none mb-12"
          rows={1}
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div id="editorjs" className="min-h-125" />
        </div>
      </section>
    </main>
  );
};

export default EditBlog;
