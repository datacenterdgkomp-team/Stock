
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useComboboxWithCreate } from '@/hooks/useComboboxWithCreate';
import { toast } from 'sonner';

const ComboboxField = ({
  collectionName,
  label,
  value,
  onChange,
  placeholder = 'Pilih...',
  minLength = 3,
  maxLength = 50,
  required = true,
  error: externalError
}) => {
  const [open, setOpen] = useState(false);
  
  const {
    items,
    filteredItems,
    searchQuery,
    setSearchQuery,
    selectedValue,
    setSelectedValue,
    isLoading,
    isCreating,
    error: internalError,
    handleCreate,
    showCreateOption,
    isValidSelection
  } = useComboboxWithCreate({
    collectionName,
    minLength,
    maxLength,
    required,
    initialValue: value
  });

  const handleSelect = (currentValue) => {
    // Prevent sending non-existent IDs
    const selected = items.find((item) => item.id === currentValue);
    if (selected) {
      setSelectedValue(currentValue);
      onChange(currentValue);
      setOpen(false);
    } else {
      toast.error('Kategori/Jenis/Merek tidak ditemukan. Silakan pilih dari daftar yang tersedia.');
    }
  };

  const handleCreateNew = async () => {
    const newItem = await handleCreate(searchQuery.trim());
    if (newItem && newItem.id) {
      onChange(newItem.id);
      setOpen(false);
    }
  };

  const selectedItem = items.find((item) => item.id === selectedValue);
  
  // Combine internal and external errors, displaying a fallback validation error if selection is invalid
  const displayError = externalError || internalError || (!isValidSelection ? 'Kategori/Jenis/Merek tidak ditemukan. Silakan pilih dari daftar yang tersedia.' : null);

  // Only show active items in the dropdown, UNLESS it's the currently selected item (backward compatibility)
  const displayItems = filteredItems.filter(item => item.status === 'aktif' || item.id === selectedValue);

  return (
    <div className="flex flex-col space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !selectedValue && "text-muted-foreground",
              displayError && "border-destructive focus:ring-destructive"
            )}
          >
            {selectedValue && selectedItem ? selectedItem.nama : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder={`Cari ${label}...`} 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memuat...
                  </div>
                ) : showCreateOption ? (
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                      onClick={handleCreateNew}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Tambah "{searchQuery}" sebagai {label} baru
                    </Button>
                  </div>
                ) : (
                  `Tidak ada ${label} ditemukan.`
                )}
              </CommandEmpty>
              <CommandGroup>
                {displayItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.nama}
                    {item.status !== 'aktif' && (
                      <span className="ml-2 text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">Nonaktif</span>
                    )}
                  </CommandItem>
                ))}
                {showCreateOption && displayItems.length > 0 && (
                  <CommandItem
                    onSelect={handleCreateNew}
                    className="text-primary font-medium"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah "{searchQuery}" sebagai {label} baru
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {displayError && (
        <p className="text-sm font-medium text-destructive">{displayError}</p>
      )}
    </div>
  );
};

export default ComboboxField;
