import ProtectedRoute from "@/components/app/ProtectedRoute";
import Layout from "@/pages/layout";

export default function SettingsLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <ProtectedRoute>
      <Layout
        pageName="Settings"
        subpage={title}
        subtitle={description}
        childrenClassname="max-w-5xl"
      >
        <div className="mx-auto grid h-full w-full">
          <div className="py-4">{children}</div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
