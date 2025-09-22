import Head from 'next/head';
import AdminDashboard from '../../components/admin/AdminDashboard';

const AdminPage = () => {
  return (
    <>
      <Head>
        <title>Admin Dashboard - MerryMatch</title>
        <meta name="description" content="Admin panel for MerryMatch application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AdminDashboard />
    </>
  );
};

export default AdminPage;