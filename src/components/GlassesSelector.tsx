import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Check } from "lucide-react";
import aviatorGlasses from "@/assets/glasses-aviator.png";
import wayfarGlasses from "@/assets/glasses-wayfare.png";
import roundGlasses from "@/assets/glasses-round.png";
import catEyeGlasses from "@/assets/glasses-cat-eye.png";

interface GlassesSelectorProps {
  selectedGlasses: string;
  onGlassesChange: (glasses: string) => void;
}

const glassesOptions = [
  {
    id: "aviator",
    name: "Aviator Classic",
    description: "Timeless pilot-style frames",
    color: "Silver",
    price: "$199",
    image: aviatorGlasses
  },
  {
    id: "wayfare",
    name: "Wayfare Bold",
    description: "Iconic rectangular frames",
    color: "Black",
    price: "$249",
    image: wayfarGlasses
  },
  {
    id: "round",
    name: "Round Vintage", 
    description: "Classic circular frames",
    color: "Gold",
    price: "$179",
    image: roundGlasses
  },
  {
    id: "cat-eye",
    name: "Cat-Eye Retro",
    description: "Vintage feminine style",
    color: "Pink",
    price: "$229",
    image: catEyeGlasses
  }
];

export const GlassesSelector = ({ selectedGlasses, onGlassesChange }: GlassesSelectorProps) => {
  return (
    <div className="space-y-4">
      {glassesOptions.map((glasses) => (
        <Card
          key={glasses.id}
          className={`relative cursor-pointer transition-all duration-200 ${
            selectedGlasses === glasses.id
              ? 'bg-tech-surface-hover border-tech-glow/60 shadow-[var(--shadow-tech)]'
              : 'bg-tech-surface border-border hover:bg-tech-surface-hover hover:border-tech-glow/30'
          }`}
          onClick={() => onGlassesChange(glasses.id)}
        >
          <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-tech-glass-overlay rounded-lg p-2">
                    <img 
                      src={glasses.image} 
                      alt={glasses.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{glasses.name}</h3>
                    {selectedGlasses === glasses.id && (
                      <div className="w-5 h-5 bg-tech-glow rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{glasses.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-tech-surface-hover">
                      {glasses.color}
                    </Badge>
                    <span className="text-sm font-medium text-tech-glow">{glasses.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Selection indicator */}
          {selectedGlasses === glasses.id && (
            <div className="absolute inset-0 bg-tech-glow/5 rounded-lg pointer-events-none">
              <div className="absolute top-2 right-2 w-6 h-6 bg-tech-glow rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
          )}
        </Card>
      ))}
      
      {/* Try On Instructions */}
      <Card className="bg-tech-surface/50 border-tech-glow/20 border-dashed">
        <div className="p-4 text-center">
          <div className="text-tech-glow mb-2">
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="font-medium text-foreground mb-1">How it works</h4>
          <p className="text-xs text-muted-foreground">
            Select a style above and position your face in the camera frame. 
            The glasses will automatically align to your features.
          </p>
        </div>
      </Card>
    </div>
  );
};