"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Eye, EyeOff, Plus, LayoutGrid, Type, Image as ImageIcon, Link as LinkIcon, Video, Pencil, X, ChevronUp, ChevronDown } from "lucide-react";
import { addBlock, deleteBlock, toggleActiveStatus, editBlock, moveBlock } from "./action";

type BlockItem = {
  id: string;
  type: "link" | "image" | "text" | "video";
  title: string | null;
  url: string | null;
  iconUrl: string | null;
  isPrimary: boolean;
  isActive: boolean;
};

export default function ClientUI({ initialBlocks }: { initialBlocks: BlockItem[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [blockType, setBlockType] = useState<"link" | "image" | "text" | "video">("link");
  const [formData, setFormData] = useState({ title: "", url: "", iconUrl: "", isPrimary: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    let res;
    if (editingId) {
      res = await editBlock(editingId, formData);
    } else {
      res = await addBlock({ type: blockType, ...formData });
    }
    
    if (res?.error) {
      toast.error(res?.error);
    } else {
      toast.success(editingId ? "Block updated successfully!" : "Block created successfully!");
      handleCancelEdit(); 
    }
    setIsLoading(false);
  };

  const handleEditClick = (block: BlockItem) => {
    setEditingId(block.id);
    setBlockType(block.type);
    setFormData({
      title: block.title || "",
      url: block.url || "",
      iconUrl: block.iconUrl || "",
      isPrimary: block.isPrimary,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", url: "", iconUrl: "", isPrimary: false });
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const res = await moveBlock(id, direction);
    if (res?.error) toast.error(res.error);
  };

  const renderIcon = (type: string) => {
    switch(type) {
      case 'link': return <LinkIcon size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'text': return <Type size={16} />;
      case 'video': return <Video size={16} />;
      default: return <LayoutGrid size={16} />;
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
      
      <div className={`border p-6 sm:p-8 rounded-3xl h-max shadow-xl transition-all ${editingId ? "bg-sunlight-orange/10 border-sunlight-orange/50" : "bg-white/5 border-white/10"}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${editingId ? "bg-sunlight-orange text-blue-marine" : "bg-sunlight-orange/20 text-sunlight-orange"}`}>
              {editingId ? <Pencil size={20} /> : <Plus size={20} />}
            </div>
            <h2 className="font-display font-bold text-xl text-white">
              {editingId ? "Edit Block" : "Create New Block"}
            </h2>
          </div>
          {editingId && (
            <button onClick={handleCancelEdit} className="p-2 rounded-full hover:bg-white/10 text-silver-shine hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className={`grid grid-cols-4 gap-2 mb-6 border-b border-white/10 pb-6 ${editingId ? "opacity-50 pointer-events-none" : ""}`}>
          {(['link', 'image', 'text', 'video'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setBlockType(type)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${blockType === type ? "bg-sunlight-orange text-blue-marine border-sunlight-orange font-bold shadow-lg" : "bg-white/5 border-white/10 text-silver-shine hover:bg-white/10"}`}
            >
              {renderIcon(type)}
              <span className="text-[10px] uppercase tracking-wider mt-1.5">{type}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {(blockType === "link" || blockType === "text" || blockType === "image") && (
            <div>
              <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">
                {blockType === "text" ? "Judul Subheading" : blockType === "image" ? "Alt Text (Optional)" : "Display Title"}
              </label>
              <textarea 
                required={blockType === "text" || blockType === "link"} 
                rows={blockType === "text" ? 2 : 1}
                placeholder={blockType === "text" ? "Contoh: KOMPETISI UTAMA" : "e.g., Register for Mini Competition"}
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange text-sm resize-none"
              />
            </div>
          )}

          {(blockType === "link" || blockType === "image" || blockType === "video") && (
            <div>
              <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">
                {blockType === "video" ? "YouTube Embed URL" : blockType === "image" ? "Image Source URL" : "Target URL"}
              </label>
              <input 
                required type="url" placeholder="https://..."
                value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange text-sm"
              />
            </div>
          )}

          {(blockType === "link" || blockType === "image") && (
            <div>
              <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">
                {blockType === "image" ? "Target Link URL (Optional - For Guidebook)" : "Icon URL (Optional)"}
              </label>
              <input 
                type="url" placeholder="https://..."
                value={formData.iconUrl} onChange={(e) => setFormData({...formData, iconUrl: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange text-sm"
              />
            </div>
          )}

          {blockType === "link" && (
            <label className="flex items-center gap-3 cursor-pointer mt-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" checked={formData.isPrimary} onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
                className="w-5 h-5 accent-sunlight-orange rounded"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Highlight as Primary Link</span>
                <span className="text-xs text-silver-shine">Displays with a glowing orange aesthetic</span>
              </div>
            </label>
          )}

          <div className="flex gap-3 mt-2">
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="flex-1 bg-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/20 transition-colors shadow-lg">
                Cancel
              </button>
            )}
            <button type="submit" disabled={isLoading} className={`flex-[2] text-blue-marine font-bold py-3.5 rounded-xl transition-colors shadow-lg bg-sunlight-orange hover:bg-yellow-400`}>
              {isLoading ? "Processing..." : editingId ? "Update Block" : "Publish Block"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl h-max">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-sunlight-orange/20 rounded-lg"><LayoutGrid className="text-sunlight-orange" size={20} /></div>
          <h2 className="font-display font-bold text-xl text-white">Content Manager</h2>
        </div>

        <div className="flex flex-col gap-3">
          {initialBlocks.length === 0 ? (
            <p className="text-center text-silver-shine text-sm py-8 border border-dashed border-white/20 rounded-2xl">
              No content blocks found. Start building!
            </p>
          ) : (
            initialBlocks.map((block, index) => (
              <div key={block.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${block.isActive ? "bg-black/30 border-white/10" : "bg-black/10 border-white/5 opacity-60"} ${editingId === block.id ? "ring-2 ring-sunlight-orange" : ""}`}>
                
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex flex-col gap-1 mr-1 shrink-0 bg-white/5 rounded-lg border border-white/5 p-1">
                    <button onClick={() => handleMove(block.id, "up")} disabled={index === 0} className="p-0.5 text-silver-shine hover:text-sunlight-orange disabled:opacity-20 transition-colors">
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => handleMove(block.id, "down")} disabled={index === initialBlocks.length - 1} className="p-0.5 text-silver-shine hover:text-sunlight-orange disabled:opacity-20 transition-colors">
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  <div className="p-2 bg-white/5 rounded-lg text-sunlight-orange mt-0.5">{renderIcon(block.type)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm truncate">{block.title || (block.type === 'video' ? 'Video Player' : 'Image Block')}</h3>
                      {block.isPrimary && <span className="bg-sunlight-orange/20 text-sunlight-orange text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Primary</span>}
                      {!block.isActive && <span className="bg-maroon-flash/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Hidden</span>}
                    </div>
                    {block.url && <p className="text-xs text-silver-shine truncate max-w-[200px] sm:max-w-xs">{block.url}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleEditClick(block)}
                    title="Edit Block"
                    className="p-2.5 rounded-xl bg-white/5 border border-transparent text-silver-shine hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => toggleActiveStatus(block.id, block.isActive)}
                    title={block.isActive ? "Hide from public" : "Show to public"}
                    className="p-2.5 rounded-xl bg-white/5 border border-transparent text-silver-shine hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {block.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm("Permanently delete this block?")) {
                        const res = await deleteBlock(block.id);
                        if (res?.error) toast.error(res.error);
                      }
                    }}
                    title="Delete Block"
                    className="p-2.5 rounded-xl bg-maroon-flash/10 border border-transparent text-red-400 hover:border-red-400 hover:bg-maroon-flash/30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}