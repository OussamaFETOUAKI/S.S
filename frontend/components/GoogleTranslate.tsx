"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "ar", name: "العربية" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "zh-CN", name: "中文" },
    { code: "ja", name: "日本語" }
];

export default function GoogleTranslate() {
    const [selectedLang, setSelectedLang] = useState("en");

    useEffect(() => {
        // 1. Sync React state with the current translation cookie
        if (typeof document !== "undefined") {
            const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
            if (match && match[1]) {
                setSelectedLang(match[1]);
            }
        }

        // 2. Load the Google Translate script invisibly
        const initTranslate = () => {
            if (!(window as any).google?.translate?.TranslateElement) return;
            new (window as any).google.translate.TranslateElement(
                { pageLanguage: 'en', autoDisplay: false },
                'google_translate_element'
            );
        };

        if (!document.getElementById("google-translate-script")) {
            (window as any).googleTranslateElementInit = initTranslate;
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        } else {
            // Re-init on navigation if needed
            initTranslate();
        }
    }, []);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        setSelectedLang(lang);
        
        // 3. Force Google Translate by setting the cookie
        document.cookie = `googtrans=/en/${lang}; path=/`;
        document.cookie = `googtrans=/en/${lang}; domain=${window.location.hostname}; path=/`;
        
        // 4. Force a hard reload to apply translation globally
        window.location.reload();
    };

    return (
        <div className="relative group w-[150px] h-[40px] flex items-center justify-center bg-slate-900/60 backdrop-blur-2xl rounded-xl border border-white/5 shadow-2xl hover:border-sky-400 transition-all overflow-hidden notranslate ml-4">
            {/* Hidden container for Google's native script */}
            <div id="google_translate_element" className="hidden"></div>

            {/* Custom Modern Globe Icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-sky-400 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            </div>
            
            {/* Custom Transparent Select Element */}
            <select 
                value={selectedLang}
                onChange={handleLanguageChange}
                className="w-full h-full bg-transparent text-white text-[11px] font-black uppercase tracking-widest pl-[36px] pr-8 cursor-pointer outline-none appearance-none z-20 relative"
            >
                {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                        {lang.name}
                    </option>
                ))}
            </select>

            {/* Custom Dropdown Arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-sky-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
        </div>
    );
}
