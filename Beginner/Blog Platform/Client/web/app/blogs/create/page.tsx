"use client";
import { useEffect, useRef, useState, JSX } from "react";
import Navbar from "@/app/_Components/Navbar";
import { Save, Eye, Trash2, X } from "lucide-react";

/**
 * MINI RENDERER COMPONENT
 * This mirrors your Single Blog Page's design to provide an accurate preview.
 */
const BlogPreviewRenderer = ({ data, title }: { data: any; title: string }) => {
  if (!data || !data.blocks) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 w-full">
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-serif italic text-studio-green leading-tight mb-8">
          {title || "Untitled Narrative"}
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-studio-green" />
          <p className="text-sm italic opacity-60">Draft Preview</p>
        </div>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
        {data.blocks.map((block: any, index: number) => {
          switch (block.type) {
            case "header":
              const Tag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
              return (
                <Tag
                  key={index}
                  className="text-3xl font-serif italic text-studio-green dark:text-white mt-12"
                >
                  {block.data.text}
                </Tag>
              );
            case "paragraph":
              return (
                <p
                  key={index}
                  className="text-gray-600 dark:text-gray-400 leading-relaxed font-light"
                  dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
              );
            case "list":
              const ListTag = block.data.style === "ordered" ? "ol" : "ul";
              return (
                <ListTag
                  key={index}
                  className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400"
                >
                  {block.data.items.map((item: string, i: number) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ListTag>
              );
            case "image":
              return (
                <figure key={index} className="my-12">
                  <img
                    src={block.data.file.url}
                    alt={block.data.caption}
                    className={`rounded-4xl border border-gray-100 dark:border-white/5 ${block.data.stretched ? "w-full" : "max-w-2xl mx-auto"}`}
                  />
                  {block.data.caption && (
                    <figcaption className="text-center text-xs font-serif italic text-studio-accent mt-4">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

const CreateBlog = () => {
  const ejInstance = useRef<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [title, setTitle] = useState("");

  // Initialize Editor.js on Mount
  useEffect(() => {
    if (!ejInstance.current) {
      initEditor();
    }
    return () => {
      ejInstance.current?.destroy();
      ejInstance.current = null;
    };
  }, []);

  const initEditor = async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const List = (await import("@editorjs/list")).default;
    const ImageTool = (await import("@editorjs/image")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;

    const editor = new EditorJS({
      holder: "editorjs",
      placeholder: "Begin your architectural narrative...",
      tools: {
        header: {
          class: Header as any,
          config: { placeholder: "Heading", levels: [2, 3], defaultLevel: 2 },
        },
        list: List as any,
        inlineCode: InlineCode as any,
        image: {
          class: ImageTool as any,
          config: {
            endpoints: {
              byFile: "http://localhost:5000/api/upload/image", // Replace with your Express URL
            },
          },
        },
      },
      data: { blocks: [] },
    });

    ejInstance.current = editor;
  };

  const handleSave = async () => {
    if (ejInstance.current) {
      setIsSaving(true);
      try {
        const outputData = await ejInstance.current.save();
        const payload = { title, content: outputData };

        // Example: await fetch('...', { method: 'POST', body: JSON.stringify(payload) });
        console.log("Saving Payload:", payload);

        alert("Entry archived successfully.");
      } catch (error) {
        console.error("Save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePreviewToggle = async () => {
    if (ejInstance.current) {
      const data = await ejInstance.current.save();
      setPreviewData(data);
      setIsPreviewOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar />

      {/* FLOATING ACTION DOCK */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg">
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
          <button className="p-3 text-foreground/60 hover:text-red-500 transition-colors">
            <Trash2 size={20} />
          </button>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-studio-green transition-colors">
              <Eye size={16} /> Preview
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-studio-green text-background px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-studio-accent transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? "Archiving..." : "Publish Entry"}
            </button>
          </div>
        </div>
      </div>

      {/* EDITOR WORKSPACE */}
      <section className="pt-32 pb-40 px-6 max-w-4xl mx-auto">
        <textarea
          placeholder="Untitled Story"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-5xl md:text-7xl font-serif italic text-studio-green outline-none placeholder:text-gray-100 dark:placeholder:text-white/5 resize-none mb-12 h-auto"
          rows={1}
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div id="editorjs" className="min-h-125 studio-editor-ui" />
        </div>
      </section>

      {/* FULLSCREEN PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-100 flex flex-col bg-background animate-in fade-in duration-300 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-6 py-4 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Archive Draft Preview
            </span>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          <BlogPreviewRenderer data={previewData} title={title} />
        </div>
      )}
    </main>
  );
};

export default CreateBlog;
