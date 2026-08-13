import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const langs = [
  { code: "en", label: "English", native: "EN" },
  { code: "hi", label: "हिंदी", native: "HI" },
  { code: "gu", label: "ગુજરાતી", native: "GU" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [current, setCurrent] = useState(i18n.language || "en");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("awh-lang");
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
      setCurrent(saved);
    }
  }, [i18n]);

  const change = (code: string) => {
    if (code === current) return;
    localStorage.setItem("awh-lang", code);
    i18n.changeLanguage(code);
    setCurrent(code);
    document.documentElement.lang = code;
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  const currentLang = langs.find((l) => l.code === current) ?? langs[0];

  return (
    <>
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] pointer-events-none bg-gold/10"
          />
        )}
      </AnimatePresence>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-cosmic-silver/80 hover:text-gold transition-colors px-2 py-1.5 rounded-md hover:bg-gold/5">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.label}</span>
          <span className="sm:hidden">{currentLang.native}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-gold border-gold/30 min-w-[160px]">
          {langs.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => change(l.code)}
              className="cursor-pointer flex items-center justify-between gap-3"
            >
              <span>{l.label}</span>
              {current === l.code && <Check className="h-3.5 w-3.5 text-gold" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default LanguageSwitcher;
