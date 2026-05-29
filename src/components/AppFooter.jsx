import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const APPS = [
  {
    name: "Bind - Calm Create",
    url: "https://bind-calm-create.base44.app",
    icon: "📚",
  },
  {
    name: "Bind - Craft Calm",
    url: "https://bind-craft-calm.base44.app",
    icon: "🎨",
  },
  {
    name: "Print - Masked Flow Pro",
    url: "https://print-masked-flow-pro.base44.app",
    icon: "🖨️",
  },
];

export default function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-4 font-semibold">
          Mis otras apps
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {APPS.map((app) => (
            <a
              key={app.url}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button
                variant="outline"
                className="w-full justify-center gap-2 group-hover:border-primary group-hover:bg-primary/5 transition-colors"
              >
                <span className="text-base">{app.icon}</span>
                <span className="truncate">{app.name}</span>
                <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
              </Button>
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6 text-center">
          © {new Date().getFullYear()} Diseño Técnico de Cajas
        </p>
      </div>
    </footer>
  );
}