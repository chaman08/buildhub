import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/constants';

interface ServiceCategorySelectorProps {
    selectedCategories: string | string[];
    onChange: (categories: string[]) => void;
    multiSelect?: boolean;
}

const ServiceCategorySelector: React.FC<ServiceCategorySelectorProps> = ({
    selectedCategories,
    onChange,
    multiSelect = true
}) => {
    const [customCategory, setCustomCategory] = useState('');

    const currentCategories = Array.isArray(selectedCategories)
        ? selectedCategories
        : selectedCategories ? [selectedCategories] : [];

    const handleToggle = (category: string) => {
        if (multiSelect) {
            if (currentCategories.includes(category)) {
                onChange(currentCategories.filter(c => c !== category));
            } else {
                onChange([...currentCategories, category]);
            }
        } else {
            onChange([category]);
        }
    };

    const addCustomCategory = () => {
        if (customCategory.trim() && !currentCategories.includes(customCategory.trim())) {
            onChange([...currentCategories, customCategory.trim()]);
            setCustomCategory('');
        }
    };

    const removeCategory = (category: string) => {
        onChange(currentCategories.filter(c => c !== category));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SERVICE_CATEGORIES.map((category) => {
                    const isSelected = currentCategories.includes(category);
                    return (
                        <Button
                            key={category}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggle(category)}
                            className={`justify-start h-auto py-2 text-left whitespace-normal ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white hover:bg-gray-50'}`}
                        >
                            {category}
                        </Button>
                    );
                })}
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Add custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomCategory();
                        }
                    }}
                    className="flex-1"
                />
                <Button
                    type="button"
                    onClick={addCustomCategory}
                    size="sm"
                    className="bg-slate-900 text-white hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {currentCategories.length > 0 && multiSelect && (
                <div className="flex flex-wrap gap-2">
                    {currentCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                            {category}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => removeCategory(category)}
                            />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceCategorySelector;
