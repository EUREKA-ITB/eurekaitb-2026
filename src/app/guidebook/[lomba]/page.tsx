import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GuidebookViewer({ params }: { params: { lomba: string } }) {
  // Parsing nama lomba untuk estetika judul
  const formatName = params.lomba.replace(/_/g, " ").toUpperCase();
  
  // Asumsi path PDF kamu ada di folder public/guidebooks/
  const pdfUrl = `/guidebooks/${params.lomba}.pdf#toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 md:p-8 box-border pt-24 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header Viewer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-sunlight-orange">
              GUIDEBOOK : {formatName}
            </h1>
            <p className="text-silver-shine text-sm">Baca buku panduan lengkap kompetisi di bawah ini.</p>
          </div>
          <div className="flex gap-4">
            <a 
              href={`/guidebooks/${params.lomba}.pdf`} 
              download
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm"
            >
              ↓ Download PDF
            </a>
            <Link 
              href="/" 
              className="flex items-center gap-2 bg-maroon-flash hover:bg-red-800 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
          </div>
        </div>

        {/* Frame PDF Estetik */}
        <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative min-h-[70vh]">
          <object 
            data={pdfUrl} 
            type="application/pdf" 
            className="w-full h-full absolute inset-0"
          >
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-silver-shine mb-4">Browser kamu tidak mendukung pembaca PDF langsung.</p>
              <a href={`/guidebooks/${params.lomba}.pdf`} className="text-sunlight-orange underline">Unduh Guidebook di sini</a>
            </div>
          </object>
        </div>

      </div>
    </div>
  );
}