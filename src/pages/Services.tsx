import PageLayout from "@/components/PageLayout";
import ServicesSection from "@/components/ServicesSection";
import TrustSection from "@/components/TrustSection";
import MoneyBackGuaranteeSection from "@/components/MoneyBackGuaranteeSection";

const Services = () => (
  <PageLayout title="Our Sacred Services" subtitle="Personalised Vedic guidance for every dimension of your life.">
    <ServicesSection />
    <MoneyBackGuaranteeSection />
    <TrustSection />
  </PageLayout>
);

export default Services;
