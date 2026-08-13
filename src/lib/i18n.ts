import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      nav: { home: "Home", about: "About", services: "Services", shop: "Shop", gallery: "Gallery", videos: "Videos", blog: "Blog", testimonials: "Testimonials", contact: "Contact", booking: "Book Now", faq: "FAQ", consultNow: "Consult Now", cart: "Cart", admin: "Admin", signIn: "Sign In", signOut: "Sign Out", myOrders: "My Orders" },
      common: { addToCart: "Add to Cart", buyNow: "Order on WhatsApp", outOfStock: "Out of Stock", price: "Price", quantity: "Quantity", total: "Total", subtotal: "Subtotal", inquire: "Inquire", viewDetails: "View Details", learnMore: "Learn More", readMore: "Read More", submit: "Submit", loading: "Loading...", noResults: "Nothing here yet.", all: "All" },
      home: { tagline: "Vedic · Cosmic · Premium" },
      footer: { rights: "All rights reserved.", quote: "As above, so below.", explore: "Explore", connect: "Connect", legal: "Legal", privacy: "Privacy Policy", refund: "Refund Policy", terms: "Terms & Conditions" },
    },
  },
  hi: {
    translation: {
      nav: { home: "होम", about: "हमारे बारे में", services: "सेवाएँ", shop: "शॉप", gallery: "गैलरी", videos: "वीडियो", blog: "ब्लॉग", testimonials: "प्रशंसापत्र", contact: "संपर्क", booking: "बुक करें", faq: "सामान्य प्रश्न", consultNow: "अभी परामर्श", cart: "कार्ट", admin: "एडमिन", signIn: "साइन इन", signOut: "साइन आउट", myOrders: "मेरे ऑर्डर" },
      common: { addToCart: "कार्ट में जोड़ें", buyNow: "व्हाट्सएप पर ऑर्डर", outOfStock: "स्टॉक खत्म", price: "कीमत", quantity: "मात्रा", total: "कुल", subtotal: "उप-योग", inquire: "पूछताछ", viewDetails: "विवरण देखें", learnMore: "और जानें", readMore: "पढ़ें", submit: "भेजें", loading: "लोड हो रहा है...", noResults: "अभी कुछ नहीं।", all: "सभी" },
      home: { tagline: "वैदिक · कॉस्मिक · प्रीमियम" },
      footer: { rights: "सर्वाधिकार सुरक्षित।", quote: "जैसा ऊपर, वैसा नीचे।", explore: "एक्सप्लोर", connect: "संपर्क करें", legal: "कानूनी", privacy: "गोपनीयता नीति", refund: "रिफंड नीति", terms: "नियम और शर्तें" },
    },
  },
  gu: {
    translation: {
      nav: { home: "હોમ", about: "અમારા વિશે", services: "સેવાઓ", shop: "શોપ", gallery: "ગૅલેરી", videos: "વિડિઓ", blog: "બ્લોગ", testimonials: "પ્રશંસાપત્રો", contact: "સંપર્ક", booking: "બુક કરો", faq: "પ્રશ્નો", consultNow: "હમણાં સલાહ", cart: "કાર્ટ", admin: "એડમિન", signIn: "સાઇન ઇન", signOut: "સાઇન આઉટ", myOrders: "મારા ઓર્ડર" },
      common: { addToCart: "કાર્ટમાં ઉમેરો", buyNow: "વોટ્સએપ પર ઓર્ડર", outOfStock: "સ્ટોકમાં નથી", price: "કિંમત", quantity: "જથ્થો", total: "કુલ", subtotal: "પેટા-કુલ", inquire: "પૂછપરછ", viewDetails: "વિગતો જુઓ", learnMore: "વધુ જાણો", readMore: "વાંચો", submit: "મોકલો", loading: "લોડ થઈ રહ્યું છે...", noResults: "હજુ કંઈ નથી.", all: "બધા" },
      home: { tagline: "વૈદિક · કોસ્મિક · પ્રીમિયમ" },
      footer: { rights: "બધા હકો અનામત.", quote: "જે ઉપર છે, તે નીચે છે.", explore: "એક્સપ્લોર", connect: "સંપર્ક", legal: "કાનૂની", privacy: "ગોપનીયતા નીતિ", refund: "રિફંડ નીતિ", terms: "નિયમો અને શરતો" },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("awh-lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
