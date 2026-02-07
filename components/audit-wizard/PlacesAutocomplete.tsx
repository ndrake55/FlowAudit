"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { searchPlaces, getPlaceDetails } from "@/app/actions/places";

// Note: We need a simple debounce hook. If not available, we can inline it or install use-debounce.
// For now I'll implement a simple effect-based debounce.

interface PlacesAutocompleteProps {
    onSelect: (data: {
        description: string;
        placeId: string;
        lat: number;
        lng: number;
    }) => void;
    selectedAddress?: string;
}

export function PlacesAutocomplete({
    onSelect,
    selectedAddress,
}: PlacesAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [suggestions, setSuggestions] = React.useState<{ description: string; place_id: string }[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Simple debounce logic
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (!value || value.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const results = await searchPlaces(value);
                setSuggestions(results);
            } catch (err) {
                console.error(err);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [value]);

    const handleSelect = async (address: string, placeId: string) => {
        setValue(address); // Keep the selected value
        setOpen(false);

        // We already have placeId, now get details via server action
        try {
            const details = await getPlaceDetails(placeId);
            if (details) {
                onSelect({
                    description: address,
                    placeId,
                    lat: details.lat,
                    lng: details.lng
                });
            }
        } catch (error) {
            console.error("Details error:", error);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedAddress || "Search property address..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    {/* Note: CommandInput onChange does NOT support async directly usually, so we handle value state manually */}
                    <CommandInput
                        placeholder="Search address..."
                        value={value}
                        onValueChange={setValue}
                    />
                    <CommandList>
                        {loading && (
                            <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                            </div>
                        )}
                        {!loading && suggestions.length === 0 && value.length > 2 && (
                            <CommandEmpty>No address found.</CommandEmpty>
                        )}
                        <CommandGroup heading="Suggestions">
                            {suggestions.map((item) => (
                                <CommandItem
                                    key={item.place_id}
                                    value={item.description}
                                    onSelect={() => handleSelect(item.description, item.place_id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedAddress === item.description
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {item.description}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
