import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import OrdersDashboard from "@/components/admin/OrdersDashboard";
import OrderManager from "@/components/admin/OrderManager";

/** Dedicated admin order management screen (guarded by AdminRoute). */
const AdminOrders = () => (
  <PageLayout title="Order Management">
    <SEO title="Order Management" description="Admin order management." path="/admin/orders" noindex />
    <div className="container max-w-7xl">
      <OrdersDashboard />
      <OrderManager />
    </div>
  </PageLayout>
);

export default AdminOrders;
