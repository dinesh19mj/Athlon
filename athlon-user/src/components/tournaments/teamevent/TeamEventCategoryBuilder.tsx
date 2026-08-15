import React from 'react';
import { PlusIcon, TrashIcon } from 'lucide-react';

export interface TeamEventCategoryConfig {
    id: string;
    name: string;
    matchFormat: string;
    playersRequired: number;
}

interface Props {
    categories: TeamEventCategoryConfig[];
    onChange: (categories: TeamEventCategoryConfig[]) => void;
}

export const TeamEventCategoryBuilder: React.FC<Props> = ({ categories, onChange }) => {
    
    const inputClass = "w-full bg-[#0D1520] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all placeholder:text-white/25";
    const labelClass = "block text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5";

    const handleAddCategory = () => {
        onChange([
            ...categories, 
            { id: Date.now().toString(), name: '', matchFormat: 'Men\'s Singles', playersRequired: 1 }
        ]);
    };

    const handleRemoveCategory = (id: string) => {
        onChange(categories.filter(c => c.id !== id));
    };

    const handleUpdateCategory = (id: string, field: keyof TeamEventCategoryConfig, value: any) => {
        onChange(categories.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className={labelClass}>Team Event Categories</label>
                <button
                    type="button"
                    onClick={handleAddCategory}
                    className="flex items-center gap-1 text-[#1B9C56] text-xs font-bold hover:underline"
                >
                    <PlusIcon className="w-4 h-4" /> Add Category
                </button>
            </div>

            {categories.length === 0 ? (
                <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-white/40 text-sm">No categories added yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {categories.map((cat, index) => (
                        <div key={cat.id} className="p-4 bg-white/5 rounded-xl border border-white/10 relative group">
                            <button
                                type="button"
                                onClick={() => handleRemoveCategory(cat.id)}
                                className="absolute top-2 right-2 text-white/30 hover:text-red-500 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                            <div className="text-[10px] font-bold text-white/50 uppercase mb-3">Category {index + 1}</div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Name</label>
                                    <input 
                                        type="text"
                                        value={cat.name}
                                        onChange={(e) => handleUpdateCategory(cat.id, 'name', e.target.value)}
                                        placeholder="e.g. Open"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Format</label>
                                    <select
                                        value={cat.matchFormat}
                                        onChange={(e) => {
                                            const format = e.target.value;
                                            const isDoubles = format.includes("Doubles");
                                            handleUpdateCategory(cat.id, 'matchFormat', format);
                                            handleUpdateCategory(cat.id, 'playersRequired', isDoubles ? 2 : 1);
                                        }}
                                        className={`${inputClass} appearance-none`}
                                    >
                                        <option value="Men's Singles">Men's Singles</option>
                                        <option value="Women's Singles">Women's Singles</option>
                                        <option value="Men's Doubles">Men's Doubles</option>
                                        <option value="Women's Doubles">Women's Doubles</option>
                                        <option value="Mixed Doubles">Mixed Doubles</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Players Required</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        value={cat.playersRequired}
                                        onChange={(e) => handleUpdateCategory(cat.id, 'playersRequired', parseInt(e.target.value) || 1)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
