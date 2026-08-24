"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { CategoryService } from "@/lib/api/tournaments";
import { OrganizationService } from "@/lib/api/organization";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function CreateCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const orgUuid = params.orgId as string;

  const { userId } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnTo(params.get("returnTo"));
  }, []);

  const [formData, setFormData] = useState({
    categoryName: "",
    sportType: "",
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const orgResponse = await OrganizationService.getById(orgUuid);
      const orgData = orgResponse.data; 
      
      if (!orgData || !orgData.orgId) {
        throw new Error("Could not load organization details.");
      }

      await CategoryService.create({
        organizationId: orgData.orgId,
        organizationUuid: orgUuid,
        sportType: formData.sportType,
        categoryName: formData.categoryName,
        createdBy: userId ? Number(userId) : 0
      });
      
      if (returnTo === "create-tournament") {
        router.push(`/org/${orgUuid}/tournaments/create`);
      } else {
        router.push(`/org/${orgUuid}/tournaments`);
      }
    } catch (error) {
      console.error("Failed to create category", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-[#0D1520] border border-white/10 rounded-2xl px-4 py-4 text-white text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/25 font-medium";

  const labelClass = "block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-background pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center gap-4">
        <Link 
          href={returnTo === "create-tournament" ? `/org/${orgUuid}/tournaments/create` : `/org/${orgUuid}/tournaments`} 
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-white/50 text-sm font-bold tracking-widest uppercase"> ADD CATEGORY</span>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-7 max-w-2xl mx-auto">

        {/* CATEGORY NAME */}
        <div>
          <label className={labelClass}>Category Name <span className="text-primary">*</span></label>
          <input
            type="text"
            value={formData.categoryName}
            onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
            className={inputClass}
            placeholder="E.g. Open, U-19, Veteran..."
          />
        </div>

        {/* SPORT */}
        <div>
          <label className={labelClass}>Sport <span className="text-primary">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {['Badminton', 'Cricket', 'Football', 'Volleyball'].map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => setFormData({ ...formData, sportType: sport })}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${formData.sportType === sport
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-white/10 bg-[#0D1520] text-white/50 hover:border-white/25 hover:text-white/80'
                  }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={!formData.categoryName.trim() || !formData.sportType || isSubmitting}
          className="w-full bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-black text-base font-black uppercase tracking-wider py-5 rounded-2xl transition-all hover:bg-primary-dark active:scale-95 shadow-[0_8px_30px_rgba(27,156,86,0.3)] mt-8"
        >
          {isSubmitting ? "Adding..." : "Add Category"}
        </button>

      </div>
    </div>
  );
}
