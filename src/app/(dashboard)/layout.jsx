import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { DynamicBreadcrumb } from '@/components/layout/Breadcrumb';

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 lg:p-6">
              {/* Breadcrumb */}
              <div className="mb-4">
                <DynamicBreadcrumb />
              </div>

              {/* Page Content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}